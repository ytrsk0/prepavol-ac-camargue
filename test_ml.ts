import MLR from 'ml-regression-multivariate-linear';
const MultivariateLinearRegression = MLR;
import { FLEET } from './src/data/fleet';
import fs from 'fs';

function extractDataFromCsv(csvPath: string) {
  const content = fs.readFileSync(csvPath, 'utf8').trim().split('\n');
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
      
      const x0 = alt;
      const x1 = tempK;
      const x2 = mass;
      
      X.push([1, x0, x1, x2, x0*x0, x0*x1, x0*x2, x1*x1, x1*x2, x2*x2]);
      y.push([dist]);
    }
  }
  return { X, y };
}

const tkData = extractDataFromCsv('data/S200_takeoff.csv');
const ldData = extractDataFromCsv('data/S200_landing.csv');

const mlrTk = new MultivariateLinearRegression(tkData.X, tkData.y, { intercept: false });
const mlrLd = new MultivariateLinearRegression(ldData.X, ldData.y, { intercept: false });

console.log("poly feat 2");

function predictScale(operation: 'takeoff'|'landing', distance: number) {
  if (operation === 'takeoff') {
    const headwindCoeffs = [1, 0.85, 0.65, 0.55];
    const asphalt = headwindCoeffs.map(c => Math.round(distance * c));
    const grass = asphalt.map(d => Math.round(d * 1.15));
    return { asphalt, grass };
  } else {
    const headwindCoeffs = [1, 0.78, 0.63, 0.52];
    const asphalt = headwindCoeffs.map(c => Math.round(distance * c));
    const grass = asphalt.map(d => Math.round(d * 1.15));
    return { asphalt, grass };
  }
}

function test(idx: number, alt: number, tempC: number, mass: number, mlr: any, op: 'takeoff'|'landing') {
  const x0 = alt;
  const x1 = tempC + 273;
  const x2 = mass;
  const feats = [1, x0, x1, x2, x0*x0, x0*x1, x0*x2, x1*x1, x1*x2, x2*x2];
  const pred = mlr.predict([feats])[0][0];
  console.log(`[${op}] alt=${alt}, temp=${tempC}, mass=${mass} -> DIST=${pred.toFixed(2)} [base]`);
  console.log(`[${op}] -> ${JSON.stringify(predictScale(op, pred))}`);
}

test(1, 0, 15, 750, mlrTk, 'takeoff');
test(2, 5000, 30, 750, mlrTk, 'takeoff');
test(3, 8000, -10, 750, mlrTk, 'takeoff');
test(4, 0, 15, 500, mlrTk, 'takeoff');

console.log("\nJSON dump of the exact weights (for use in calculations.ts):");
const tkWs = mlrTk.weights.map((v: any) => v[0]);
const ldWs = mlrLd.weights.map((v: any) => v[0]);
console.log("export const S200_TAKEOFF_MLR_WEIGHTS = " + JSON.stringify(tkWs) + ";");
console.log("export const S200_LANDING_MLR_WEIGHTS = " + JSON.stringify(ldWs) + ";");
