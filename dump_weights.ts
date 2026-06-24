import MLR from 'ml-regression-multivariate-linear';
import fs from 'fs';

function getWeights(csvPath: string) {
  try {
    const raw = fs.readFileSync(csvPath, 'utf8');
    if (raw.includes("<!DOCTYPE") || raw.includes("<html>") || raw.includes("Page Not Found")) {
       return null;
    }
    const content = raw.trim().split('\n');
    const header = content[0].split('\t');
    
    const X: number[][] = [];
    const y: number[][] = [];
    
    for (let i = 1; i < content.length; i++) {
      const vals = content[i].split('\t');
      const alt = Number(vals[0]);
      const tempC = Number(vals[1]);
      const tempK = tempC + 273;
      
      for (let j = 2; j < header.length; j++) {
        const mass = Number(header[j]);
        const dist = Number(vals[j]);
        if (isNaN(dist)) continue; // in case of empty cells
        
        const x0 = alt;
        const x1 = tempK;
        const x2 = mass;
        
        X.push([1, x0, x1, x2, x0*x0, x0*x1, x0*x2, x1*x1, x1*x2, x2*x2]);
        y.push([dist]);
      }
    }
    const mlr = new MLR(X, y, { intercept: false });
    return mlr.weights.map((v: any) => v[0]);
  } catch (e) {
    return null;
  }
}

const planes = ['S200', 'DR400-120', 'C152'];
console.log("export const MLR_MODELS = {");
for (const p of planes) {
  const tk = getWeights(`data/${p}_takeoff.csv`);
  const ld = getWeights(`data/${p}_landing.csv`);
  console.log(`  '${p}': {`);
  if (tk) console.log(`    takeoff: [${tk.join(',')}],`);
  if (ld) console.log(`    landing: [${ld.join(',')}],`);
  console.log(`  },`);
}
console.log("};");
