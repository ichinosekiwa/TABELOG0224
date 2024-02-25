import { chromium } from 'playwright-core';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({
    channel: 'chrome', //ここで指定することで既存のchromeを利用可能
    headless: false, //falseの場合はブラウザ上での動きを確認しながら実行可能
  });
  const page = await browser.newPage();
  //りクエストの間隔を3秒空ける
  await page.waitForTimeout(3000);
  await page.goto('https://tabelog.com/kanagawa/A1405/A140504/R9897/rstLst/', {
    waitUntil: 'domcontentloaded',
  });
  const restaurants: { name: string; star: string }[] = [];

  async function scrapePage() {
    // 店名を取得（要素が表示されるのを待つ
    await page.waitForSelector('h3.list-rst__rst-name');
    const names = await page.locator('h3.list-rst__rst-name').all();
    //スターを取得（要素が表示されるのを待つ
    await page.waitForSelector('.c-rating__val');
    const stars = await page.locator('.c-rating__val').all();

    for (let i = 0; i < names.length; i++) {
      const nameElement = names[i];
      const starElement = stars[i];

      //要素が存在しない場合の処理
      if (!nameElement || !starElement) {
        console.log('Name or star element not found.');
        continue;
      }
      const name = await nameElement.textContent();

      const star = await starElement.textContent();
      restaurants.push({ name: name || '', star: star || '' });
    }
  }

  await scrapePage();
  // 次のページがあればスクレイプを繰り返す
  while (true) {
    // 次のページボタンが存在するか確認
    if ((await page.locator('a.c-pagination__arrow--next').count()) === 0) break;
    const nextPageButton = page.locator('a.c-pagination__arrow--next');
    // ボタンがクリック可能になるまで待つ
    await nextPageButton.waitFor({ state: 'attached' });

    await page.waitForTimeout(3000);

    await Promise.all([nextPageButton.click(), page.waitForLoadState('domcontentloaded', { timeout: 3000 })]);
    await scrapePage();
  }
  //JSONファイルに保存
  const jsonContent = JSON.stringify(restaurants, null, 2);
  fs.writeFileSync('restaurants.json', jsonContent);
  console.log('Scraping completed. Results saved to restaurants.json.');
  await browser.close(); //⑤ブラウザ終了
})();
