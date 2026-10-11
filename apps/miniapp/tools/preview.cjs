'use strict';
// Serve build output only. Do not expose Vite's source/HMR server.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=fs.realpathSync(path.resolve(__dirname,'../dist/build/h5'));
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
function createPreview(){return http.createServer((req,res)=>{
 const host=req.headers.host;
 if(!/^127\.0\.0\.1:\d+$/.test(host||'')){res.writeHead(403);return res.end('Forbidden host')}
 const origin=`http://${host}`;
 if(req.headers.origin&&req.headers.origin!==origin){res.writeHead(403);return res.end('Forbidden origin')}
 if(req.headers['sec-fetch-site']==='cross-site'){res.writeHead(403);return res.end('Forbidden site')}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end()}
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,origin).pathname)}catch{res.writeHead(400);return res.end()}
 const candidate=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 let file;try{file=fs.realpathSync(candidate)}catch{res.writeHead(404);return res.end()}
 if(!file.startsWith(root+path.sep)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end()}
 res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Cache-Control','no-store');
 if(req.method==='HEAD')return res.end();fs.createReadStream(file).pipe(res);
})}
module.exports={createPreview};
if(require.main===module)createPreview().listen(8877,'127.0.0.1',()=>console.log('Local H5 preview: http://127.0.0.1:8877/ (built assets only; rebuild after edits)'));
