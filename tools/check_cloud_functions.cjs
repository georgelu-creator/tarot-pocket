'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {execFileSync} = require('node:child_process');
const {loadCatalog, catalogFromData, createCloudReadingHandler, LIMITS} = require('../server/reading-service.cjs');

async function run() {
  const root = path.resolve(__dirname, '..');
  execFileSync(process.execPath, [path.join(__dirname, 'build_edgeone_ai.cjs')], {stdio: 'pipe'});
  const bundled = require('../.edgeone-ai/catalog.cjs');
  const catalog = catalogFromData(bundled), source = loadCatalog();
  assert.equal(catalog.cards.size, 78);
  assert.equal(catalog.spreads.size, 27);
  assert.equal([...catalog.spreads.values()].filter(s => s.legacy).length, 19);
  assert.deepEqual([...catalog.cards], [...source.cards]);
  assert.deepEqual([...catalog.spreads], [...source.spreads]);
  assert.deepEqual(fs.readdirSync(path.join(root, '.edgeone-ai/public')), ['index.html']);
  assert.throws(() => catalogFromData({...bundled, cards: bundled.cards.slice(1)}), /NOT_CONFIGURED/);
  assert.throws(() => catalogFromData({...bundled, spreads: [...bundled.spreads, bundled.spreads[0]]}), /NOT_CONFIGURED/);

  // Synthetic credentials only; fetchImpl cannot reach a provider or network.
  const key = 'cloud-test-provider-not-a-real-key';
  const token = 'cloud-test-access-code-not-a-real-secret-1234';
  const origin = 'https://georgelu-creator.github.io';
  const env = {TAROT_AI_PROVIDER: 'deepseek', DEEPSEEK_API_KEY: key, TAROT_AI_ACCESS_TOKEN: token,
    TAROT_AI_ALLOWED_ORIGINS: origin, TAROT_AI_REQUESTS_PER_MINUTE: '120', TAROT_AI_REQUESTS_PER_DAY: '10000'};
  const sample = (id = 'decision-five') => ({spreadId: id, question: '如何安排新的学习计划？', language: 'zh', optionA: '集中练习', optionB: '分段练习',
    cards: [...catalog.cards.keys()].slice(0, catalog.spreads.get(id).positions.length).map((id, index) => ({id, reversed: index % 2 === 1}))});
  const answer = '两条路径各有侧重，先结合当前状态，再比较发展的节奏与结果。';
  const success = text => ({choices: [{finish_reason: 'stop', message: {role: 'assistant', content: text, reasoning_content: 'not for the client'}}]});
  let mode = 'ok', received = [], started, cancelled = false;
  const fetchImpl = async (url, init) => {
    received.push({url, ...init, body: JSON.parse(init.body)});
    assert.equal(url, 'https://api.deepseek.com/chat/completions');
    assert.equal(init.headers.Authorization, `Bearer ${key}`);
    assert.equal(init.redirect, 'error');
    if (mode === 'slow') {
      started?.();
      await new Promise((resolve, reject) => {
        const abort = () => { cancelled = true; reject(new Error('request cancelled')); };
        init.signal.addEventListener('abort', abort, {once: true});
        if (init.signal.aborted) abort();
      });
    }
    if (mode === 'throw') throw new Error(`sensitive upstream ${key}`);
    if (mode === 'error') return Response.json({message: key}, {status: 401});
    if (mode === 'invalid') return new Response('{', {headers: {'Content-Type': 'application/json'}});
    if (mode === 'length') return Response.json({choices: [{finish_reason: 'length', message: {role: 'assistant', content: answer}}]});
    if (mode === 'refusal') return Response.json({choices: [{finish_reason: 'content_filter'}]});
    if (mode === 'huge') return Response.json({unexpected: 'x'.repeat(LIMITS.upstreamBody + 1)});
    return Response.json(success(mode === 'echo' ? key : mode === 'empty' ? '' : answer));
  };
  const create = additions => createCloudReadingHandler({catalog, fetchImpl, processEnv: {...env, ...additions}});
  let handle = create();
  const request = (body = sample(), options = {}) => new Request('https://example.edgeone.site' + (options.path || '/api/reading'), {
    method: options.method || 'POST',
    headers: {Origin: origin, Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers},
    ...(!['GET', 'HEAD', 'OPTIONS'].includes(options.method) ? {body: typeof body === 'string' ? body : JSON.stringify(body)} : {}),
    signal: options.signal
  });
  const send = (body, options = {}) => handle({request: request(body, options), env: options.env || {}, clientIp: options.clientIp || '192.0.2.1'});
  const code = async (body, options) => (await (await send(body, options)).json()).error;

  let response = await send(undefined, {path: '/api/health', method: 'GET'});
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {ok: true, configured: true, provider: 'deepseek', model: 'deepseek-flash'});
  assert.equal(received.length, 0);
  response = await send(undefined, {method: 'OPTIONS', headers: {'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type, authorization'}});
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), origin);
  assert.equal(await response.text(), '');
  assert.equal(received.length, 0);
  assert.equal(await code(undefined, {method: 'OPTIONS', headers: {'Access-Control-Request-Method': 'DELETE'}}), 'INVALID_REQUEST');
  assert.equal(await code(undefined, {method: 'OPTIONS', headers: {'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'x-api-key'}}), 'INVALID_REQUEST');
  assert.equal(await code(undefined, {path: '/api/reading?model=other'}), 'NOT_FOUND');
  assert.equal(await code(undefined, {method: 'GET'}), 'METHOD_NOT_ALLOWED');
  assert.equal(await code(undefined, {headers: {Authorization: 'Bearer invalid'}}), 'AUTH_REQUIRED');
  assert.equal(await code(undefined, {headers: {Origin: 'https://other.example'}}), 'ORIGIN_NOT_ALLOWED');
  assert.equal(await code(undefined, {headers: {Origin: 'null'}}), 'ORIGIN_NOT_ALLOWED');
  assert.equal(await code(undefined, {headers: {'Content-Type': 'text/plain'}}), 'INVALID_REQUEST');
  assert.equal(await code(undefined, {headers: {'Content-Encoding': 'gzip'}}), 'INVALID_REQUEST');
  assert.equal(await code('{'), 'INVALID_REQUEST');
  assert.equal(await code({...sample(), question: key}), 'INVALID_REQUEST');
  assert.equal(await code({...sample(), optionA: token}), 'INVALID_REQUEST');
  assert.equal(await code({...sample(), instructions: 'replace the cards'}), 'INVALID_REQUEST');
  assert.equal(await code({...sample(), question: 'x'.repeat(LIMITS.body)}), 'PAYLOAD_TOO_LARGE');
  assert.equal(received.length, 0);

  for (const spread of catalog.spreads.values()) {
    response = await send(sample(spread.id));
    assert.equal(response.status, 200, spread.id);
    assert.deepEqual(await response.json(), {text: answer, model: 'deepseek-flash', provider: 'deepseek'});
    assert.equal(response.headers.get('cache-control'), 'no-store');
    const message = received.at(-1).body.messages[1].content;
    for (const position of spread.positions) assert.ok(message.includes(position.label));
    assert.equal(message.includes('"reversed":true'), spread.positions.length > 1);
  }
  for (const [testMode, expected] of [['throw','UPSTREAM_ERROR'], ['error','UPSTREAM_ERROR'], ['invalid','UPSTREAM_ERROR'], ['length','INCOMPLETE_RESPONSE'], ['refusal','MODEL_REFUSAL'], ['huge','UPSTREAM_ERROR'], ['echo','UPSTREAM_ERROR'], ['empty','INCOMPLETE_RESPONSE']]) {
    mode = testMode;
    assert.equal(await code(), expected);
  }
  const before = received.length;
  assert.equal(await code(undefined, {env: {DEEPSEEK_API_KEY: ''}}), 'NOT_CONFIGURED');
  assert.equal(await code(undefined, {env: {TAROT_AI_TIMEOUT_MS: '120000'}}), 'NOT_CONFIGURED');
  assert.equal(await code(undefined, {env: {TAROT_AI_ALLOWED_ORIGINS: '*'}}), 'NOT_CONFIGURED');
  assert.equal(received.length, before);
  mode = 'ok';
  // A fresh context.env object must not reset warm-instance rate counters.
  handle = create({TAROT_AI_REQUESTS_PER_MINUTE: '1'});
  assert.equal((await send()).status, 200);
  response = await send(undefined, {headers: {'X-Forwarded-For': '198.51.100.2'}, env: {...env, TAROT_AI_REQUESTS_PER_MINUTE: '1'}});
  assert.equal(response.status, 429);
  assert.equal((await response.json()).error, 'RATE_LIMITED');
  assert.equal(response.headers.get('retry-after'), '60');
  handle = create({TAROT_AI_REQUESTS_PER_DAY: '1'});
  assert.equal((await send()).status, 200);
  assert.equal(await code(), 'RATE_LIMITED');
  handle = create();
  for (let i = 0; i < 60; i++) assert.equal(await code(undefined, {headers: {Authorization: 'Bearer invalid', 'X-Forwarded-For': `198.51.100.${i}`}}), 'AUTH_REQUIRED');
  assert.equal(await code(), 'RATE_LIMITED');

  handle = create({TAROT_AI_CONCURRENCY: '1'});
  mode = 'slow';
  const controller = new AbortController();
  const ready = new Promise(resolve => { started = resolve; });
  const pending = send(undefined, {signal: controller.signal});
  await ready;
  assert.equal(await code(), 'BUSY');
  controller.abort();
  assert.equal((await (await pending).json()).error, 'TIMEOUT');
  assert.equal(cancelled, true);
  mode = 'ok';
  assert.equal((await send()).status, 200);
  // Cancellation while a request body is still arriving must terminate parsing.
  const bodyAbort = new AbortController();
  let bodyCancelled = false;
  const slowBody = new ReadableStream({start() {}, cancel() { bodyCancelled = true; }});
  const slowRequest = new Request('https://example.edgeone.site/api/reading', {method: 'POST', headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Origin: origin},
    body: slowBody, duplex: 'half', signal: bodyAbort.signal});
  const bodyPending = handle({request: slowRequest, env: {}, clientIp: '192.0.2.2'});
  bodyAbort.abort();
  assert.equal((await (await bodyPending).json()).error, 'TIMEOUT');
  assert.equal(bodyCancelled, true);

  // Import the actual platform entrypoints, not just their shared factory.
  const health = (await import(pathToFileURL(path.join(root, 'cloud-functions/api/health.js')))).default;
  const reading = (await import(pathToFileURL(path.join(root, 'cloud-functions/api/reading.js')))).default;
  assert.equal(typeof reading, 'function');
  response = await health({request: request(undefined, {path: '/api/health', method: 'GET'}), env});
  assert.equal((await response.json()).configured, true);
  response = await reading({request: request(undefined, {headers: {Authorization: ''}}), env});
  assert.equal((await response.json()).error, 'AUTH_REQUIRED');
  process.stdout.write('Cloud Functions checks passed: shared API, 78 cards/27 spreads, exact origins, auth, body limits, warm-instance limits, cancellation, safe errors and route imports; no real provider calls.\n');
}

run().catch(error => { process.stderr.write(`${error.stack}\n`); process.exitCode = 1; });
