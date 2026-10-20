/* This release is Chinese-only. Stable IDs and saved records remain unchanged. */
(() => {
  'use strict';
  const locale='zh-CN',missing=new Set();
  const translate=value=>value;
  function sync(){
    document.documentElement.lang=locale;
    document.title='秘境梦屿';
  }
  function setLocale(){
    sync();
    document.dispatchEvent(new CustomEvent('tarot-language-change',{detail:{locale}}));
  }
  window.TAROT_I18N={get locale(){return locale;},translate,setLocale,missing};
  sync();
})();
