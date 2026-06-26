import fs from 'fs';

let content = fs.readFileSync('src/components/FleetAdmin.tsx', 'utf8');

// Replace gear icon with Info (Eye if imported, but Info is there)
content = content.replace(/<Settings className="w-4 h-4" \/>/, '<Eye className="w-4 h-4" />');
// Wait, we need to import Eye
if (!content.includes('Eye,')) {
    content = content.replace(/import \{/, 'import { Eye, ');
}

// Remove Admin Login section
content = content.replace(/\{!auth\.currentUser \? \([\s\S]*?\) : \([\s\S]*?\}\)/, '');
content = content.replace(/<div className="flex items-center gap-4">\s*<\/div>/g, '');

// Make everything readonly
content = content.replace(/disabled=\{loading\}/g, 'disabled={true}');
content = content.replace(/onChange=\{.*?}/g, 'onChange={() => {}} disabled={true}');
content = content.replace(/onBlur=\{.*?}/g, 'onBlur={() => {}} disabled={true}');

// Hide delete button
content = content.replace(/<button[\s\S]*?onClick=\{.*?handleDelete.*?\}[\s\S]*?<\/button>/, '');
content = content.replace(/<button\s*onClick=\{\(\) => handleDelete.*?\}[\s\S]*?<\/button>/g, '');

// Change button 'Save Changes' to 'Close' or just hide save button
content = content.replace(/<button[\s\S]*?onClick=\{handleSave\}[\s\S]*?<\/button>/, '');

// Remove Edit functions that write to DB
content = content.replace(/const handleSave = async \(\) => \{[\s\S]*?^\s*\};/m, 'const handleSave = async () => {};');

// Remove handleLogin, handleLogout
content = content.replace(/const handleLogin = async \(\) => \{[\s\S]*?^\s*\};/m, '');
content = content.replace(/const handleLogout = async \(\) => \{[\s\S]*?^\s*\};/m, '');

// We will do this safely by rewriting the whole file since it's cleaner.
