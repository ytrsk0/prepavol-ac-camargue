
import fs from 'fs';

function csvToGrid(path: string) {
    if (!fs.existsSync(path)) return [];
    const raw = fs.readFileSync(path, 'utf8');
    if (raw.includes("<!DOCTYPE")) return [];
    
    const lines = raw.trim().split('\n');
    const header = lines[0].split('\t');
    const weights = header.slice(2).map(Number);
    
    const data: any[] = [];
    for (let i = 1; i < lines.length; i++) {
        const vals = lines[i].split('\t');
        if (vals.length < 3) continue;
        const alt = Number(vals[0]);
        const temp = Number(vals[1]);
        const distances: any = {};
        for (let j = 0; j < weights.length; j++) {
            distances[weights[j]] = Number(vals[j + 2]);
        }
        data.push({ alt, temp, distances });
    }
    return data;
}

const planes = ['S200', 'DR400-120', 'DR400-140', 'DR400-140B', 'DR400-160'];
for (const p of planes) {
    const to = csvToGrid(`data/${p}_takeoff.csv`);
    const ld = csvToGrid(`data/${p}_landing.csv`);
    const varPrefix = p.replace('-', '_');
    console.log(`const ${varPrefix}_TO_50FT: PerformancePoint[] = ${JSON.stringify(to, null, 2)};\n`);
    console.log(`const ${varPrefix}_LD_50FT: PerformancePoint[] = ${JSON.stringify(ld, null, 2)};\n`);
}
