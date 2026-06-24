import fs from 'fs';

async function ext(url: string, name: string) {
  const res = await fetch(url);
  const text = await res.text();
  fs.writeFileSync('data/' + name, text);
}

fs.mkdirSync('data', { recursive: true });

const planes = ['S200', 'DR400-120']; // Are there others? Let's check planes.py
// Wait, the Python planes.py is generic depending on self.planetype.

const urls = [
  'https://gitlab.com/yannick.teresiak/flaskapp/-/raw/d161e05308d6c31c9526da1687a79231c664df7e/services/web/prepavol/prepavol/data/S200_takeoff.csv',
  'https://gitlab.com/yannick.teresiak/flaskapp/-/raw/d161e05308d6c31c9526da1687a79231c664df7e/services/web/prepavol/prepavol/data/S200_landing.csv',
  'https://gitlab.com/yannick.teresiak/flaskapp/-/raw/d161e05308d6c31c9526da1687a79231c664df7e/services/web/prepavol/prepavol/data/DR400-120_takeoff.csv',
  'https://gitlab.com/yannick.teresiak/flaskapp/-/raw/d161e05308d6c31c9526da1687a79231c664df7e/services/web/prepavol/prepavol/data/DR400-120_landing.csv',
  'https://gitlab.com/yannick.teresiak/flaskapp/-/raw/d161e05308d6c31c9526da1687a79231c664df7e/services/web/prepavol/prepavol/data/C152_takeoff.csv',
  'https://gitlab.com/yannick.teresiak/flaskapp/-/raw/d161e05308d6c31c9526da1687a79231c664df7e/services/web/prepavol/prepavol/data/C152_landing.csv'
];

async function main() {
  for (const url of urls) {
    const fn = url.split('/').pop()!;
    console.log("fetching", fn);
    await ext(url, fn);
  }
}
main();
