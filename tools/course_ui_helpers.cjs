/* Navigate the learner-facing course directory without bypassing disclosure UI. */
'use strict';
async function home(page){
  if(await page.locator('.academy-shell').count())await page.locator('[data-academy=home]').first().click();
  else if(!await page.locator('.academy-home').count())await page.locator('[data-action=nav][data-page=courses]').first().click();
}
async function catalog(page,level){
  await home(page);
  if(level)await page.locator(`[data-academy=level][data-value="${level}"]`).click();
  if(!await page.locator('.academy-catalog').count())await page.locator('[data-academy=catalog]').click();
}
async function open(page,id,level){
  await catalog(page,level||(/^[BIA]\d\d$/.test(id)?id[0]:'B'));
  const button=page.locator(`[data-academy=${/^[BIA]\d\d$/.test(id)?'start':'guided-card'}][data-id="${id}"]`);
  const chapter=button.locator('xpath=ancestor::details[1]');
  if(await chapter.count()&&await chapter.getAttribute('open')===null)await chapter.locator(':scope > summary').click();
  await button.click();
}
module.exports={home,catalog,open};
