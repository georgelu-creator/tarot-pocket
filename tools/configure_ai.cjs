/* Configure a public backend endpoint, never a credential. */
const fs=require('node:fs'),path=require('node:path');
const value=process.argv[2],fallback=process.argv[3]||'';if(value===undefined){console.error('Usage: node tools/configure_ai.cjs https://your-service.example/api/reading [https://backup.example/api/reading] (or empty string to disconnect)');process.exit(1);}
const validate=raw=>{if(!raw)return '';const u=new URL(raw);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.pathname!=='/api/reading')throw Error('Use the exact HTTPS /api/reading URL without credentials or query parameters');return u.origin;};
const origin=validate(value),fallbackOrigin=validate(fallback);if(fallback&&!value)throw Error('A backup requires a primary service');
const root=path.resolve(__dirname,'..');
const sessionFor=raw=>raw?raw.replace(/\/reading$/,'/session'):'';
const sessionEndpoint=sessionFor(value),fallbackSessionEndpoint=sessionFor(fallback);
fs.writeFileSync(path.join(root,'ai-config.js'),'/* Public service URLs only. Never add a provider key or invitation code. */\nwindow.TAROT_AI_CONFIG = '+JSON.stringify({endpoint:value,sessionEndpoint,...(fallback?{fallbackEndpoint:fallback,fallbackSessionEndpoint}:{})})+';\n');
const file=path.join(root,'index.html'),html=fs.readFileSync(file,'utf8');if(!html.includes("connect-src 'self'"))throw Error('Expected source CSP');fs.writeFileSync(file,html.replace(/connect-src [^;]+;/,"connect-src 'self'"+[...new Set([origin,fallbackOrigin].filter(Boolean))].map(item=>' '+item).join('')+';'));
console.log('Public endpoint configured. Rebuild and verify before publishing.');
