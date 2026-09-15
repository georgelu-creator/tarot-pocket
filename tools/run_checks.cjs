const {spawn}=require('node:child_process');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const run=(cmd,args,env=process.env)=>new Promise((resolve,reject)=>{
  const child=spawn(cmd,args,{cwd:root,env,stdio:'inherit'});
  child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error(`${cmd} ${args.join(' ')} exited ${code}`)));
});
(async()=>{
  await run(process.execPath,['tools/check_ai_server.cjs']);
  await run(process.execPath,['tools/check_cloud_functions.cjs']);
  await run(process.env.PYTHON||'python3',['tools/verify_assets.py']);
  await run(process.execPath,['tools/check_locales.cjs']);
  await run(process.execPath,['tools/check_card_back.cjs']);
  await run(process.env.PYTHON||'python3',['tools/build_demo.py']);
  const server=http.createServer((req,res)=>{
    if(new URL(req.url,'http://localhost').pathname!=='/tarot-demo.html'){res.writeHead(404);res.end();return;}
    res.setHeader('Content-Type','text/html; charset=utf-8');
    fs.createReadStream(path.join(root,'demo/tarot-demo.html')).pipe(res);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const env={...process.env,DEMO_URL:`http://127.0.0.1:${server.address().port}/tarot-demo.html`};
  try{for(const file of ['check_experience_v16.cjs','check_daily_almanac.cjs','check_home_alignment.cjs','check_shuffle_v152.cjs','check_swipe_v152.cjs','check_ai_wait_v152.cjs','check_reading_v12.cjs','check_demo.cjs','check_learning.cjs','check_reading.cjs','check_ritual_ui.cjs','check_ui_v11.cjs','check_i18n.cjs','check_design.cjs','check_curriculum.cjs','check_journey.cjs','check_learning_v13.cjs','check_ritual_v13.cjs','check_dossier_v13.cjs','check_reveal_webkit.cjs','check_reading_connect_v14.cjs','check_guided_v14.cjs','check_offline.cjs'])await run(process.execPath,[`tools/${file}`],env);}
  finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
