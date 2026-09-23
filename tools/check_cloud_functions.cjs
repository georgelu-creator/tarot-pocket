'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {execFileSync} = require('node:child_process');
const {loadConfig, deriveInviteCode, loadCatalog, catalogFromData, createSessionToken, createCloudReadingHandler, LIMITS} = require('../server/reading-service.cjs');

async function run() {
  const root = path.resolve(__dirname, '..');
  execFileSync(process.execPath, [path.join(__dirname, 'build_edgeone_ai.cjs')], {stdio: 'pipe'});
  const bundled = require('../.edgeone-ai/catalog.cjs');
  const catalog = catalogFromData(bundled), source = loadCatalog();
  assert.equal(catalog.cards.size, 78);
  assert.equal(catalog.spreads.size, 32);
  assert.equal([...catalog.spreads.values()].filter(s => s.legacy).length, 19);
  assert.deepEqual([...catalog.cards], [...source.cards]);
  assert.deepEqual([...catalog.spreads], [...source.spreads]);
  assert.equal(catalog.scenarios.size, 25);
  assert.deepEqual([...catalog.scenarios], [...source.scenarios]);
  assert.deepEqual(fs.readdirSync(path.join(root, '.edgeone-ai/public')), ['index.html']);
  assert.throws(() => catalogFromData({...bundled, cards: bundled.cards.slice(1)}), /NOT_CONFIGURED/);
  assert.throws(() => catalogFromData({...bundled, spreads: [...bundled.spreads, bundled.spreads[0]]}), /NOT_CONFIGURED/);

  // Synthetic credentials only; fetchImpl cannot reach a provider or network.
  const key = 'cloud-test-provider-not-a-real-key';
  const token = 'cloud-test-access-code-not-a-real-secret-1234';
  const origin = 'https://georgelu-creator.github.io';
  const env = {TAROT_AI_PROVIDER: 'deepseek', DEEPSEEK_API_KEY: key, TAROT_AI_ACCESS_TOKEN: token,
    TAROT_AI_ALLOWED_ORIGINS: origin, TAROT_AI_REQUESTS_PER_MINUTE: '120', TAROT_AI_REQUESTS_PER_DAY: '10000'};
  const inviteCode=deriveInviteCode(token);
  const sessionToken=createSessionToken(loadConfig(env)).token;
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
    if (mode === 'echo-invite') return Response.json(success(inviteCode.toLowerCase()));
    return Response.json(success(mode === 'echo' ? key : mode === 'empty' ? '' : answer));
  };
  const create = additions => createCloudReadingHandler({catalog, fetchImpl, processEnv: {...env, ...additions}});
  let handle = create();
  const request = (body = sample(), options = {}) => new Request('https://example.edgeone.site' + (options.path || '/api/reading'), {
    method: options.method || 'POST',
    headers: {Origin: origin, Authorization: `Bearer ${sessionToken}`, 'Content-Type': 'application/json', ...options.headers},
    ...(!['GET', 'HEAD', 'OPTIONS'].includes(options.method) ? {body: typeof body === 'string' ? body : JSON.stringify(body)} : {}),
    signal: options.signal
  });
  const send = (body, options = {}) => handle({request: request(body, options), env: options.env || {}, clientIp: options.clientIp || '192.0.2.1'});
  const code = async (body, options) => (await (await send(body, options)).json()).error;

  let response = await send(undefined, {path: '/api/health', method: 'GET'});
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {ok: true, configured: true, provider: 'deepseek', model: 'deepseek-flash', promptVersion: 'RP-1.2.0', scenarioCount: 25});
  assert.equal(received.length, 0);
  response = await send(undefined, {method: 'OPTIONS', headers: {'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type, authorization'}});
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), origin);
  assert.equal(await response.text(), '');
  assert.equal(received.length, 0);
  response=await send({inviteCode},{path:'/api/session',headers:{Authorization:''}});
  assert.equal(response.status,200);
  assert.match((await response.json()).token,/^tp1\./);
  assert.equal(await code({inviteCode:'incorrect'},{path:'/api/session',headers:{Authorization:''}}),'AUTH_REQUIRED');
  assert.equal(await code({inviteCode:token},{path:'/api/session',headers:{Authorization:''}}),'AUTH_REQUIRED');
  assert.equal(await code(undefined, {method: 'OPTIONS', headers: {'Access-Control-Request-Method': 'DELETE'}}), 'INVALID_REQUEST');
  assert.equal(await code(undefined, {method: 'OPTIONS', headers: {'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'x-api-key'}}), 'INVALID_REQUEST');
  assert.equal(await code(undefined, {path: '/api/reading?model=other'}), 'NOT_FOUND');
  assert.equal(await code(undefined, {method: 'GET'}), 'METHOD_NOT_ALLOWED');
  assert.equal(await code(undefined, {headers: {Authorization: 'Bearer invalid'}}), 'AUTH_REQUIRED');
  assert.equal(await code(undefined, {headers: {Authorization: `Bearer ${token}`}}), 'AUTH_REQUIRED');
  assert.equal(await code(undefined, {headers: {Authorization: `Bearer ${inviteCode}`}}), 'AUTH_REQUIRED');
  assert.equal(await code(undefined, {headers: {Origin: 'https://other.example'}}), 'ORIGIN_NOT_ALLOWED');
  assert.equal(await code(undefined, {headers: {Origin: 'null'}}), 'ORIGIN_NOT_ALLOWED');
  assert.equal(await code(undefined, {headers: {'Content-Type': 'text/plain'}}), 'INVALID_REQUEST');
  assert.equal(await code(undefined, {headers: {'Content-Encoding': 'gzip'}}), 'INVALID_REQUEST');
  assert.equal(await code('{'), 'INVALID_REQUEST');
  assert.equal(await code({...sample(), question: key}), 'INVALID_REQUEST');
  assert.equal(await code({...sample(), optionA: token}), 'INVALID_REQUEST');
  assert.equal(await code({...sample(), question: inviteCode.toLowerCase()}), 'INVALID_REQUEST');
  assert.equal(await code({...sample(), instructions: 'replace the cards'}), 'INVALID_REQUEST');
  assert.equal(await code({...sample(), question: 'x'.repeat(LIMITS.body)}), 'PAYLOAD_TOO_LARGE');
  assert.equal(await code({...sample(), topic: 'injected category'}), 'INVALID_REQUEST');
  assert.equal(await code({...sample(), topic: '__proto__'}), 'INVALID_REQUEST');
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
  response = await send({...sample('open-three'), topic: 'love', question: '下个月有机会恢复联系吗？'});
  assert.equal(response.status, 200);
  const contextualBody = received.at(-1).body;
  assert.ok(contextualBody.messages[1].content.includes('"topic":{"id":"love","label":"感情关系"}'));
  assert.ok(contextualBody.messages[1].content.includes('下个月有机会恢复联系吗？'));
  assert.equal((contextualBody.messages[1].content.match(/"positionRole":"free"/g) || []).length, 3);
  assert.match(contextualBody.messages[0].content, /更偏向能/);
  assert.match(contextualBody.messages[0].content, /不能给第一、二、三张制造过去、现在、未来/);
  for (const [testMode, expected] of [['throw','UPSTREAM_ERROR'], ['error','UPSTREAM_ERROR'], ['invalid','UPSTREAM_ERROR'], ['length','INCOMPLETE_RESPONSE'], ['refusal','MODEL_REFUSAL'], ['huge','UPSTREAM_ERROR'], ['echo','UPSTREAM_ERROR'], ['echo-invite','UPSTREAM_ERROR'], ['empty','INCOMPLETE_RESPONSE']]) {
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
  const slowRequest = new Request('https://example.edgeone.site/api/reading', {method: 'POST', headers: {Authorization: `Bearer ${sessionToken}`, 'Content-Type': 'application/json', Origin: origin},
    body: slowBody, duplex: 'half', signal: bodyAbort.signal});
  const bodyPending = handle({request: slowRequest, env: {}, clientIp: '192.0.2.2'});
  bodyAbort.abort();
  assert.equal((await (await bodyPending).json()).error, 'TIMEOUT');
  assert.equal(bodyCancelled, true);

  // The deployed platform shadows .body and omits .signal. The original bytes
  // must still receive the same validation as an ordinary Web Request.
  handle = create();
  const platformRequest = request();
  Object.defineProperty(platformRequest, 'body', {get() { return sample(); }});
  Object.defineProperty(platformRequest, 'signal', {value: undefined});
  response = await handle({request: platformRequest, env: {}, clientIp: '192.0.2.3'});
  assert.equal(response.status, 200);
  const malformedPlatformRequest = request('{');
  Object.defineProperty(malformedPlatformRequest, 'body', {get() { throw new Error('platform parser failed'); }});
  response = await handle({request: malformedPlatformRequest, env: {}, clientIp: '192.0.2.3'});
  assert.equal((await response.json()).error, 'INVALID_REQUEST');

  // Import the actual platform entrypoints, not just their shared factory.
  const health = (await import(pathToFileURL(path.join(root, 'cloud-functions/api/health.js')))).default;
  const reading = (await import(pathToFileURL(path.join(root, 'cloud-functions/api/reading.js')))).default;
  const session = (await import(pathToFileURL(path.join(root, 'cloud-functions/api/session.js')))).default;
  // EdgeOne discovers onRequest during its static export scan.
  assert.equal(reading.name, 'onRequest');
  assert.equal(health.name, 'onRequest');
  assert.equal(session.name, 'onRequest');
  response = await health({request: request(undefined, {path: '/api/health', method: 'GET'}), env});
  assert.equal((await response.json()).configured, true);
  response = await session({request: request({inviteCode}, {path:'/api/session',headers:{Authorization:''}}), env});
  assert.equal(response.status,200);
  response = await reading({request: request(undefined, {headers: {Authorization: ''}}), env});
  assert.equal((await response.json()).error, 'AUTH_REQUIRED');
  if (process.argv.includes('--bundle')) await checkBundle(root, env, token, origin, sample());
  process.stdout.write('Cloud Functions checks passed: invitation sessions, shared API, 78 cards/32 spreads/25 scenarios, exact origins, auth, body limits, warm-instance limits, cancellation, safe errors and route imports; no real provider calls.\n');
}

async function checkBundle(root, env, token, origin, sample) {
  const inviteCode = deriveInviteCode(token);
  const os = require('node:os'), net = require('node:net');
  const {spawn} = require('node:child_process');
  const bundle = path.join(root, '.edgeone/cloud-functions/api-node/index.mjs');
  const metadata = JSON.parse(fs.readFileSync(path.join(root, '.edgeone/cloud-functions/api-node/config.json'), 'utf8'));
  assert.deepEqual(metadata.routes.map(route => route.src).sort(), ['^/api/health$', '^/api/reading$', '^/api/session$']);
  // The platform bundle uses port 9000. Never terminate an unrelated listener.
  const probe = net.createServer();
  await new Promise((resolve, reject) => { probe.once('error', reject); probe.listen(9000, '127.0.0.1', resolve); });
  await new Promise(resolve => probe.close(resolve));
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'tarot-edgeone-bundle-'));
  const preload = path.join(temporary, 'mock-provider.mjs');
  fs.writeFileSync(preload, `import assert from 'node:assert/strict';
globalThis.fetch = async (url, init) => {
  assert.equal(url, 'https://api.deepseek.com/chat/completions');
  assert.equal(init.headers.Authorization, 'Bearer cloud-test-provider-not-a-real-key');
  const payload = JSON.parse(init.body);
  assert.match(payload.messages[1].content, /decision-five/);
  assert.match(payload.messages[1].content, /a-development/);
  assert.match(payload.messages[1].content, /b-outcome/);
  return Response.json({choices:[{finish_reason:'stop',message:{role:'assistant',content:'Synthetic bundle reading.',reasoning_content:'hidden'}}]});
};\n`);
  const child = spawn(process.execPath, ['--import', preload, bundle], {cwd: root,
    env: {...process.env, ...env, TAROT_AI_REQUESTS_PER_MINUTE: '1'}, stdio: ['ignore', 'pipe', 'pipe']});
  let output = '';
  child.stdout.on('data', chunk => { output += chunk; });
  child.stderr.on('data', chunk => { output += chunk; });
  try {
    let health;
    for (let i = 0; i < 50; i++) {
      if (child.exitCode !== null) throw new Error('Platform bundle exited before health check');
      try { health = await fetch('http://127.0.0.1:9000/api/health'); break; }
      catch { await new Promise(resolve => setTimeout(resolve, 100)); }
    }
    assert.ok(health, 'Platform bundle must start');
    assert.equal(health.status, 200);
    assert.equal((await health.json()).configured, true);
    const login=await fetch('http://127.0.0.1:9000/api/session',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({inviteCode})});
    assert.equal(login.status,200);
    const sessionToken=(await login.json()).token;
    const send = headers => fetch('http://127.0.0.1:9000/api/reading', {method: 'POST', headers: {Origin: origin,
      'Content-Type': 'application/json', Authorization: `Bearer ${sessionToken}`, ...headers}, body: JSON.stringify(sample)});
    assert.equal((await send({Authorization: ''})).status, 401);
    const preflight = await fetch('http://127.0.0.1:9000/api/reading', {method: 'OPTIONS', headers: {Origin: origin, 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'authorization, content-type'}});
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('access-control-allow-origin'), origin);
    const answer = await send();
    assert.equal(answer.status, 200);
    assert.equal((await answer.json()).text, 'Synthetic bundle reading.');
    const limited = await send();
    assert.equal(limited.status, 429, 'The platform wrapper must preserve warm-instance rate limits');
    assert.equal((await limited.json()).error, 'RATE_LIMITED');
    process.stdout.write('Real EdgeOne bundle passed: three routes, invitation session, health, auth, preflight, native-byte POST and warm-instance rate limit.\n');
  } catch (error) {
    // Never print the generated bundle or environment. No provider calls occur.
    process.stderr.write(`Platform bundle smoke failed; ${output.includes('Uncaught Exception') ? 'an uncaught exception was reported' : 'inspect local build/runtime logs if needed'}.\n`);
    throw error;
  } finally {
    child.kill('SIGTERM');
    await new Promise(resolve => { if (child.exitCode !== null) resolve(); else child.once('exit', resolve); });
    fs.unlinkSync(preload);
    fs.rmdirSync(temporary);
  }
}

run().catch(error => { process.stderr.write(`${error.stack}\n`); process.exitCode = 1; });
