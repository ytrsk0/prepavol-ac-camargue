import fs from 'fs';

let content = fs.readFileSync('src/components/FleetAdmin.tsx', 'utf8');

// Ensure inputs have text color
content = content.replace(/outline-none/g, 'text-slate-900 dark:text-slate-100 outline-none');

fs.writeFileSync('src/components/FleetAdmin.tsx', content);
console.log('Fixed inputs');
