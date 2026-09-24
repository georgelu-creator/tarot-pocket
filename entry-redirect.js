/* Keep old GitHub Pages links useful after the primary site moves. */
(() => {
  'use strict';
  if(location.hostname!=='georgelu-creator.github.io'||!location.pathname.startsWith('/tarot-pocket'))return;
  if(new URLSearchParams(location.search).get('legacy')==='export')return;
  const target=new URL('https://tarot.georgelu.cn/');
  if(location.pathname.endsWith('/admin.html'))target.pathname='/admin.html';
  target.search=location.search;
  target.searchParams.delete('v');
  target.hash=location.hash;
  location.replace(target.href);
})();
