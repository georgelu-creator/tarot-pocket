// Verify actual generated WeChat package boundaries, without excluding runtime files.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist/build/mp-weixin'),config=JSON.parse(fs.readFileSync(path.join(root,'app.json')));
const packs=config.subPackages||config.subpackages||[];
assert.equal(packs.length,1);assert.equal(packs[0].root,'pages/card');
assert(packs[0].pages.includes('index'));
assert(!config.pages.includes('pages/card/index'));
const sizes={main:0};for(const pack of packs)sizes[pack.root]=0;
function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())walk(file);else{const rel=path.relative(root,file).split(path.sep).join('/'),pack=packs.find(p=>rel.startsWith(p.root+'/'));sizes[pack?.root||'main']+=fs.statSync(file).size;}}}
walk(root);
for(const [name,bytes]of Object.entries(sizes))assert(bytes<2*1024*1024,name+' exceeds 2 MiB: '+bytes);
assert(Object.values(sizes).reduce((a,b)=>a+b,0)<20*1024*1024);
const content=fs.readFileSync(path.join(root,'core/generated/content.js'),'utf8');
assert(!content.includes('reversedBranches'),'Full reference leaked into the main content bundle');
const article=fs.readFileSync(path.join(root,'pages/card/generated/knowledge.js'),'utf8');
assert(article.includes('reversedBranches'),'Full reference is absent from its subpackage');
const sourceRoot=path.resolve(__dirname,'../../../content/card-knowledge');
const expected=Object.assign({},...['major.json','wands-cups.json','swords-pentacles.json'].map(name=>JSON.parse(fs.readFileSync(path.join(sourceRoot,name),'utf8'))));
const compiled=require(path.join(root,'pages/card/generated/knowledge.js')).knowledge.byId;
assert.equal(Object.keys(compiled).length,78,'The card subpackage must retain all 78 articles');
assert.deepEqual(compiled,expected,'Compiled card articles differ from their authored source');
console.log('PASS generated WeChat package: '+JSON.stringify(sizes)+' bytes; complete articles in card subpackage, shared short course excerpts in main. Platform upload size validation remains separate.');
