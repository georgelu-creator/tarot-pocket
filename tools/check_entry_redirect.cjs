const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const source=fs.readFileSync(path.join(__dirname,'..','entry-redirect.js'),'utf8');
function run(location){
  let replaced='';
  const value={...location,replace(url){replaced=url;}};
  vm.runInNewContext(source,{location:value,URL});
  return replaced;
}

assert.equal(
  run({hostname:'georgelu-creator.github.io',pathname:'/tarot-pocket/',search:'?lang=zh&v=old',hash:'#reading'}),
  'https://tarot.georgelu.cn/?lang=zh#reading'
);
assert.equal(
  run({hostname:'georgelu-creator.github.io',pathname:'/tarot-pocket/admin.html',search:'?days=7',hash:''}),
  'https://tarot.georgelu.cn/admin.html?days=7'
);
assert.equal(run({hostname:'tarot.georgelu.cn',pathname:'/',search:'',hash:''}),'');
assert.equal(run({hostname:'georgelu-creator.github.io',pathname:'/another-project/',search:'',hash:''}),'');
console.log('PASS: legacy Pages links redirect to tarot.georgelu.cn while preserving useful URL state.');
