'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {createHmac, timingSafeEqual, createHash, randomBytes} = require('node:crypto');
const {DatabaseSync} = require('node:sqlite');

const EVENT_NAMES = new Set([
  'page_view','home_learn','home_read','reading_category','spread_open','reading_start',
  'reading_pick','reading_reveal','offline_reading_view','ai_confirm','ai_cancel',
  'learning_start','learning_answer','learning_complete','dossier_open','feature_click','screen_view','screen_exit'
]);
const PROP_KEYS = new Set(['spread','category','source','status','mode','phase','lang','feature','duration']);
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
    CREATE TABLE IF NOT EXISTS query_feedback (
      id TEXT PRIMARY KEY, occurred_at INTEGER NOT NULL, question TEXT NOT NULL,
      deletion_hash TEXT NOT NULL, consent_version TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS events_day_name ON events(day, name);
    CREATE INDEX IF NOT EXISTS events_day_visitor ON events(day, visitor);
  `);
  const insert = db.prepare('INSERT INTO events(occurred_at,day,visitor,session,name,page,props) VALUES(?,?,?,?,?,?,?)');
  const prune = db.prepare('DELETE FROM events WHERE occurred_at < ?');
  let cleanedDay='';
  const cleanup = stamp => {
    db.prepare('DELETE FROM query_feedback WHERE occurred_at <= ?').run(stamp-30*86400000);
    const day=new Date(stamp).toISOString().slice(0,10);
    if(day===cleanedDay)return;
    prune.run(stamp-90*86400000);cleanedDay=day;
  };
  cleanup(now());
  const hash = (kind, value, stamp) => createHmac('sha256', secret).update(`${kind}:v2:${value}`).digest('base64url').slice(0,24);
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
  function recordFeedback(raw) {
    if(!raw||raw.consent!==true||raw.consentVersion!=='query-feedback-1'||typeof raw.question!=='string'||raw.question.trim().length<1||raw.question.length>3000||Object.keys(raw).some(k=>!['question','consent','consentVersion'].includes(k)))return null;
    cleanup(now());
    if(db.prepare('SELECT COUNT(*) n FROM query_feedback').get().n>=10000)return null;
    const id=randomBytes(18).toString('base64url'),deletionToken=randomBytes(32).toString('base64url');
    db.prepare('INSERT INTO query_feedback VALUES(?,?,?,?,?)').run(id,now(),raw.question.trim(),digest(deletionToken).toString('hex'),'query-feedback-1');
    return {id,deletionToken};
  }
  function deleteFeedback(id,token) {
    if(typeof id!=='string'||typeof token!=='string'||token.length>100)return false;
    cleanup(now());
    const row=db.prepare('SELECT deletion_hash FROM query_feedback WHERE id=?').get(id);
    if(!row||!equal(row.deletion_hash,digest(token).toString('hex')))return false;
    db.prepare('DELETE FROM query_feedback WHERE id=?').run(id);return true;
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
    cleanup(now());
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
    const rows=db.prepare('SELECT occurred_at,day,visitor,session,name,page,props FROM events WHERE day>=? AND visitor IS NOT NULL ORDER BY occurred_at,id').all(start);
    const visitors=new Map(), sessions=new Map(), clicks=new Map();
    for(const row of rows){
      if(!visitors.has(row.visitor))visitors.set(row.visitor,new Set());visitors.get(row.visitor).add(row.day);
      if(!sessions.has(row.session))sessions.set(row.session,[]);sessions.get(row.session).push(row);
      if(row.name==='feature_click'){const feature=JSON.parse(row.props||'{}').feature||'unknown';clicks.set(feature,(clicks.get(feature)||0)+1);}
    }
    // Retention cohorts use the full event window even when the dashboard shows 30 days.
    const retentionStart=now()-90*86400000;
    const retentionRows=db.prepare('SELECT day,visitor FROM events WHERE occurred_at >= ? AND visitor IS NOT NULL').all(retentionStart);
    const retentionDays=new Map();
    for(const row of retentionRows){if(!retentionDays.has(row.visitor))retentionDays.set(row.visitor,new Set());retentionDays.get(row.visitor).add(row.day);}
    const firstDays=new Map(db.prepare('SELECT visitor,MIN(day) first_day FROM events WHERE visitor IS NOT NULL GROUP BY visitor').all().map(r=>[r.visitor,r.first_day]));
    const retentionStartDay=new Date(retentionStart).toISOString().slice(0,10);
    const today=new Date(now()).toISOString().slice(0,10), retention=[1,7,30].map(offset=>{
      let eligible=0,returned=0;
      for(const [visitor,activeDays]of retentionDays){const first=firstDays.get(visitor);if(first<retentionStartDay)continue;const target=new Date(Date.parse(first)+offset*86400000).toISOString().slice(0,10);if(target>=today)continue;eligible++;if(activeDays.has(target))returned++;}
      return {day:offset,eligible,returned,rate:eligible?Math.round(returned/eligible*1000)/10:null};
    });
    const exitCounts=new Map(), paths=[];
    for(const [session,events]of sessions){const screens=events.filter(e=>['screen_view','screen_exit','page_view'].includes(e.name));const last=events.at(-1);if(now()-last.occurred_at<30*60000)continue;const exit=screens.at(-1)?.page||last.page||'unknown';exitCounts.set(exit,(exitCounts.get(exit)||0)+1);paths.push({session:session.slice(0,10),at:last.occurred_at,exit,steps:events.slice(-40).map(e=>({at:e.occurred_at,page:e.page,event:e.name,feature:JSON.parse(e.props||'{}').feature||''}))});}
    const feedback=db.prepare('SELECT id,occurred_at AS at,question FROM query_feedback ORDER BY occurred_at DESC LIMIT 100').all();
    return {retention,features:[...clicks].map(([feature,count])=>({feature,count})).sort((a,b)=>b.count-a.count),exits:[...exitCounts].map(([page,count])=>({page,count})),paths:paths.sort((a,b)=>b.at-a.at).slice(0,50),feedback,generatedAt:now(),rangeDays:days,overview:{events:Number(overview.events||0),pv:Number(overview.pv||0),uv:Number(overview.uv||0)},daily,events,funnel:funnels,ai};
  }
  return {record,recordFeedback,deleteFeedback,recordServer,summary,authorize:value=>Boolean(adminToken)&&equal(value,adminToken),close:()=>db.close()};
}

module.exports = {createTelemetry, EVENT_NAMES};
