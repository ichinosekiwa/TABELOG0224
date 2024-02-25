"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_core_1 = require("playwright-core");
const fs_1 = __importDefault(require("fs"));
(() => __awaiter(void 0, void 0, void 0, function* () {
    const browser = yield playwright_core_1.chromium.launch({
        channel: 'chrome', //ここで指定することで既存のchromeを利用可能
        headless: false, //falseの場合はブラウザ上での動きを確認しながら実行可能
    });
    const page = yield browser.newPage();
    //りクエストの間隔を3秒空ける
    yield page.waitForTimeout(3000);
    yield page.goto('https://tabelog.com/kanagawa/A1405/A140504/R9897/rstLst/', {
        waitUntil: 'domcontentloaded',
    });
    const restaurants = [];
    function scrapePage() {
        return __awaiter(this, void 0, void 0, function* () {
            // 店名を取得（要素が表示されるのを待つ
            yield page.waitForSelector('h3.list-rst__rst-name');
            const names = yield page.locator('h3.list-rst__rst-name').all();
            //スターを取得（要素が表示されるのを待つ
            yield page.waitForSelector('.c-rating__val');
            const stars = yield page.locator('.c-rating__val').all();
            for (let i = 0; i < names.length; i++) {
                const nameElement = names[i];
                const starElement = stars[i];
                //要素が存在しない場合の処理
                if (!nameElement || !starElement) {
                    console.log('Name or star element not found.');
                    continue;
                }
                // textContent() を使って要素からテキストを取得する
                let name = yield nameElement.textContent();
                let star = yield starElement.textContent();
                // nullチェックを行う
                name = name ? name.trim() : '';
                star = star ? star.trim() : '';
                restaurants.push({ name, star });
            }
        });
    }
    yield scrapePage();
    // 次のページがあればスクレイプを繰り返す
    while (true) {
        // 次のページボタンが存在するか確認
        if ((yield page.locator('a.c-pagination__arrow--next').count()) === 0)
            break;
        const nextPageButton = page.locator('a.c-pagination__arrow--next');
        // ボタンがクリック可能になるまで待つ
        yield nextPageButton.waitFor({ state: 'attached' });
        yield page.waitForTimeout(3000);
        yield Promise.all([nextPageButton.click(), page.waitForLoadState('domcontentloaded', { timeout: 3000 })]);
        yield scrapePage();
    }
    //JSONファイルに保存
    const jsonContent = JSON.stringify(restaurants, null, 2);
    fs_1.default.writeFileSync('restaurants.json', jsonContent);
    console.log('Scraping completed. Results saved to restaurants.json.');
    yield browser.close(); //⑤ブラウザ終了
}))();
