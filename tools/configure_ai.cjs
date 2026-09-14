/* Configure a public backend endpoint, never a credential. */
const fs=require('node:fs'),path=require('node:path');
const value=process.argv[2];if(value===undefined){console.error('Usage: node tools/configure_ai.cjs https://your-service.example/api/reading (or empty string to disconnect)');process.exit(1);}
let origin='';if(value){const u=new URL(value);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.pathname!=='/api/reading')throw Error('Use the exact HTTPS /api/reading URL without credentials or query parameters');origin=u.origin;}
const root=path.resolve(__dirname,'..');fs.writeFileSync(path.join(root,'ai-config.js'),'/* Public service URL only. Never add a provider key or access code. */\nwindow.TAROT_AI_CONFIG = '+JSON.stringify({endpoint:value})+';\n');
const file=path.join(root,'index.html'),html=fs.readFileSync(file,'utf8');if(!html.includes("connect-src 'self'"))throw Error('Expected source CSP');fs.writeFileSync(file,html.replace(/connect-src [^;]+;/,"connect-src 'self'"+(origin?' '+origin:'')+';'));
console.log('Public endpoint configured. Rebuild and verify before publishing.');
