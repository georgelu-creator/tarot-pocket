'use strict';
const assert=require('node:assert/strict'),http=require('node:http');
const {createPreview}=require('./preview.cjs');
(async()=>{const server=createPreview();await new Promise(r=>server.listen(0,'127.0.0.1',r));const port=server.address().port;
const request=(p,headers={})=>new Promise((resolve,reject)=>http.get({hostname:'127.0.0.1',port,path:p,headers},r=>{let body='';r.on('data',c=>body+=c);r.on('end',()=>resolve({status:r.statusCode,headers:r.headers,body}))}).on('error',reject));
try{assert.equal((await request('/')).status,200);assert.equal((await request('/',{Origin:`http://127.0.0.1:${port}`})).status,200);
for(const p of ['/','/src/pages/draw/index.vue']){const r=await request(p,{Origin:'https://audit-untrusted.invalid'});assert.equal(r.status,403);assert.equal(r.headers['access-control-allow-origin'],undefined)}
assert.equal((await request('/',{Host:'untrusted.invalid'})).status,403);assert.equal((await request('/',{'Sec-Fetch-Site':'cross-site'})).status,403);
for(const p of ['/src/pages/draw/index.vue','/@vite/client','/@fs/etc/passwd','/..%2f..%2fpackage.json'])assert.equal((await request(p)).status,404);
console.log('PASS preview: built output only, cross-origin/cross-site/foreign host rejected; source/HMR/traversal unavailable');
}finally{await new Promise(r=>server.close(r))}})().catch(e=>{console.error(e);process.exitCode=1});
