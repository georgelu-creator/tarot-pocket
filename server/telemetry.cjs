'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {createHmac, timingSafeEqual, createHash} = require('node:crypto');
const {DatabaseSync} = require('node:sqlite');

const EVENT_NAMES = new Set([
  'page_view','home_learn','home_read','reading_category','spread_open','reading_start',
  'reading_pick','reading_reveal','offline_reading_view','ai_confirm','ai_cancel',
  'learning_start','learning_answer','learning_complete','dossier_open'
]);
const PROP_KEYS = new Set(['spread','category','source','status','mode','phase','lang']);
const safe = value => typeof value === 'string' && value.length <= 80 && /^[\w.:/-]*$/u.test(value);
const digest = value => createHash('sha256').update(value).digest();
const equal = (actual, expected) => typeof actual === 'string' && actual.length <= 8192 && timingSafeEqual(digest(actual), digest(expected));

function createTelemetry({file, secret, adminToken, now = Date.now} = {}) {
  if (!file || !secret) return null;
  fs.mkdirSync(path.dirname(file), {recursive: true, mode: 0o700});
  const db = new DatabaseSync(file);
  db.exec(`
    PRAGMA journal_mode=WAL;
    PRAGMA busy_timeout=3000;
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY,
      occurred_at INTEGER NOT NULL,
      day TEXT NOT NULL,
      visitor TEXT,
      session TEXT,
      name TEXT NOT NULL,
      page TEXT,
      props TEXT
    );
    CREATE INDEX IF NOT EXISTS events_day_name ON events(day, name);
    CREATE INDEX IF NOT EXISTS events_day_visitor ON events(day, visitor);
  `);
  const insert = db.prepare('INSERT INTO events(occurred_at,day,visitor,session,name,page,props) VALUES(?,?,?,?,?,?,?)');
  const prune = db.prepare('DELETE FROM events WHERE occurred_at < ?');
  let cleanedDay='';
  const cleanup = stamp => {
    const day=new Date(stamp).toISOString().slice(0,10);
    if(day===cleanedDay)return;
    prune.run(stamp-90*86400000);cleanedDay=day;
  };
  cleanup(now());
  const hash = (kind, value, stamp) => createHmac('sha256', secret).update(`${kind}:${new Date(stamp).toISOString().slice(0,7)}:${value}`).digest('base64url').slice(0,24);
  function normalize(raw, stamp = now()) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    const keys = Object.keys(raw);
    if (keys.some(key => !['name','page','visitorId','sessionId','props'].includes(key))) return null;
    if (!EVENT_NAMES.has(raw.name) || !safe(raw.page || '') || !safe(raw.visitorId || '') || !safe(raw.sessionId || '')) return null;
    if ((raw.visitorId || '').length < 16 || (raw.sessionId || '').length < 16) return null;
    const props = raw.props === undefined ? {} : raw.props;
    if (!props || typeof props !== 'object' || Array.isArray(props) || Object.keys(props).some(key => !PROP_KEYS.has(key) || !safe(String(props[key])))) return null;
    return {stamp, day:new Date(stamp).toISOString().slice(0,10), visitor:hash('visitor',raw.visitorId,stamp), session:hash('session',raw.sessionId,stamp), name:raw.name, page:raw.page || '', props:JSON.stringify(props)};
  }
  function record(raw) {
    const item=normalize(raw);if(!item)return false;
    cleanup(item.stamp);
    insert.run(item.stamp,item.day,item.visitor,item.session,item.name,item.page,item.props);return true;
  }
  function recordServer(name, props={}) {
    const stamp=now(),day=new Date(stamp).toISOString().slice(0,10);
    cleanup(stamp);
    insert.run(stamp,day,null,null,name,'/api/reading',JSON.stringify(props));
  }
  function summary(days=30) {
    const start=new Date(now()-Math.max(1,Math.min(days,90))*86400000).toISOString().slice(0,10);
    const overview=db.prepare("SELECT COUNT(*) events, COUNT(DISTINCT CASE WHEN name='page_view' THEN visitor END) uv, SUM(CASE WHEN name='page_view' THEN 1 ELSE 0 END) pv FROM events WHERE day>=?").get(start);
    const daily=db.prepare("SELECT day, SUM(CASE WHEN name='page_view' THEN 1 ELSE 0 END) pv, COUNT(DISTINCT CASE WHEN name='page_view' THEN visitor END) uv FROM events WHERE day>=? GROUP BY day ORDER BY day").all(start);
    const events=db.prepare('SELECT name, COUNT(*) count, COUNT(DISTINCT visitor) users FROM events WHERE day>=? GROUP BY name ORDER BY count DESC').all(start);
    const funnels=db.prepare("SELECT COUNT(DISTINCT CASE WHEN name='spread_open' THEN visitor END) spread_open, COUNT(DISTINCT CASE WHEN name='reading_start' THEN visitor END) reading_start, COUNT(DISTINCT CASE WHEN name='reading_reveal' THEN visitor END) reading_reveal, COUNT(DISTINCT CASE WHEN name='ai_confirm' THEN visitor END) ai_confirm FROM events WHERE day>=?").get(start);
    const aiRows=db.prepare("SELECT name, props FROM events WHERE day>=? AND name LIKE 'ai_backend_%'").all(start);
    const durations=aiRows.map(row=>Number(JSON.parse(row.props||'{}').duration)).filter(Number.isFinite).sort((a,b)=>a-b);
    const statuses={};for(const row of aiRows){const status=String(JSON.parse(row.props||'{}').status||'unknown');statuses[status]=(statuses[status]||0)+1;}
    const success=aiRows.filter(row=>row.name==='ai_backend_success').length,total=aiRows.length;
    const ai={total,success,failures:total-success,successRate:total?Math.round(success/total*1000)/10:0,averageMs:durations.length?Math.round(durations.reduce((a,b)=>a+b,0)/durations.length):0,p95Ms:durations.length?durations[Math.min(durations.length-1,Math.ceil(durations.length*.95)-1)]:0,statuses};
    return {generatedAt:now(),rangeDays:days,overview:{events:Number(overview.events||0),pv:Number(overview.pv||0),uv:Number(overview.uv||0)},daily,events,funnel:funnels,ai};
  }
  return {record,recordServer,summary,authorize:value=>Boolean(adminToken)&&equal(value,adminToken),close:()=>db.close()};
}

module.exports = {createTelemetry, EVENT_NAMES};
