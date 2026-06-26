import fs from 'fs';

let content = fs.readFileSync('src/components/FleetAdmin.tsx', 'utf8');

// Replace text colors
content = content.replace(/text-slate-900/g, 'text-slate-900 dark:text-white');
content = content.replace(/text-slate-700/g, 'text-slate-700 dark:text-slate-200');
content = content.replace(/text-slate-500/g, 'text-slate-500 dark:text-slate-400');
content = content.replace(/text-slate-400(?! dark:)/g, 'text-slate-400 dark:text-slate-500');

// Replace backgrounds
content = content.replace(/bg-white/g, 'bg-white dark:bg-slate-900');
content = content.replace(/bg-slate-50/g, 'bg-slate-50 dark:bg-slate-950');
content = content.replace(/bg-slate-900(?! dark:)/g, 'bg-slate-900 dark:bg-slate-800');

// Replace borders
content = content.replace(/border-slate-200/g, 'border-slate-200 dark:border-slate-800');
content = content.replace(/border-slate-100/g, 'border-slate-100 dark:border-slate-800/50');
content = content.replace(/border-blue-100/g, 'border-blue-100 dark:border-blue-900/30');

// Hover states
content = content.replace(/hover:bg-slate-800/g, 'hover:bg-slate-800 dark:hover:bg-slate-700');
content = content.replace(/hover:bg-blue-50/g, 'hover:bg-blue-50 dark:hover:bg-blue-900/20');
content = content.replace(/hover:bg-rose-50/g, 'hover:bg-rose-50 dark:hover:bg-rose-900/20');

// Remove redundant duplicates if any
content = content.replace(/dark:text-white dark:text-white/g, 'dark:text-white');

fs.writeFileSync('src/components/FleetAdmin.tsx', content);
console.log('Done');
