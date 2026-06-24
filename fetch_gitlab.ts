import fs from 'fs';
fetch('https://gitlab.com/yannick.teresiak/flaskapp/-/raw/d161e05308d6c31c9526da1687a79231c664df7e/services/web/prepavol/prepavol/planes.py')
  .then(res => res.text())
  .then(text => fs.writeFileSync('planes.py', text));
