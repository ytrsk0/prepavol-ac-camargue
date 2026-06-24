import fs from 'fs';
import path from 'path';

async function download(url: string, filename: string) {
  const res = await fetch(url);
  const text = await res.text();
  fs.writeFileSync(filename, text);
}

fs.mkdirSync('data', { recursive: true });
download('https://gitlab.com/yannick.teresiak/flaskapp/-/raw/d161e05308d6c31c9526da1687a79231c664df7e/services/web/prepavol/prepavol/data/S200_takeoff.csv', 'data/S200_takeoff.csv');
download('https://gitlab.com/yannick.teresiak/flaskapp/-/raw/d161e05308d6c31c9526da1687a79231c664df7e/services/web/prepavol/prepavol/data/S200_landing.csv', 'data/S200_landing.csv');
