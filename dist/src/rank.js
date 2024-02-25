"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
// JSONファイルからデータを取得
const jsonData = fs_1.default.readFileSync('restaurants.json', 'utf8');
const restaurants = JSON.parse(jsonData);
// 1→10でソートする
restaurants.sort((a, b) => parseFloat(b.star) - parseFloat(a.star));
// 上位10店を取得
const topRestaurants = restaurants.slice(0, 10);
// 上位10店をコンソールに表示
console.log('Top 10 Restaurants:');
topRestaurants.forEach((restaurant, index) => {
    console.log(`${index + 1}. ${restaurant.name} - Star: ${restaurant.star}`);
});
