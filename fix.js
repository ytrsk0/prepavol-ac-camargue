import fs from 'fs';

let content = fs.readFileSync('src/components/FleetAdmin.tsx', 'utf8');

// Fix the mistakes
content = content.replace(/dark:text-slate-400 dark:text-slate-500/g, 'dark:text-slate-400');
content = content.replace(/dark:bg-slate-900 dark:bg-slate-800/g, 'dark:bg-slate-900');
content = content.replace(/text-slate-900 dark:text-white dark:text-white/g, 'text-slate-900 dark:text-white');
content = content.replace(/text-slate-700 dark:text-slate-200 dark:text-slate-200/g, 'text-slate-700 dark:text-slate-200');

// One detail I missed earlier: we also need the inputs to have dark backgrounds.
content = content.replace(/bg-white border/g, 'bg-white dark:bg-slate-900 border');

fs.writeFileSync('src/components/FleetAdmin.tsx', content);
console.log('Fixed');
