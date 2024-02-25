import fs from 'fs';

// JSONファイルからデータを取得
const jsonData = fs.readFileSync('restaurants.json', 'utf8');
const restaurants: { name: string; star: string }[] = JSON.parse(jsonData);

// 1→10でソートする
restaurants.sort((a, b) => parseFloat(b.star) - parseFloat(a.star));
// 上位10店を取得
const topRestaurants = restaurants.slice(0, 10);

// 上位10店をコンソールに表示
console.log('Top 10 Restaurants:');
topRestaurants.forEach((restaurant, index) => {
  console.log(`${index + 1}. ${restaurant.name} - Star: ${restaurant.star}`);
});
