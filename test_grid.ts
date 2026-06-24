import { FLEET } from './src/data/fleet';
import MLR from 'ml-regression-multivariate-linear';

function runRegression(grid: any[]) {
  const X: number[][] = [];
  const y: number[][] = [];

  for (const pt of grid) {
    for (const wStr of Object.keys(pt.distances)) {
      const mass = Number(wStr);
      const dist = pt.distances[mass];
      
      const x0 = pt.alt;
      const x1 = pt.temp + 273;
      const x2 = mass;
      
      X.push([1, x0, x1, x2, x0*x0, x0*x1, x0*x2, x1*x1, x1*x2, x2*x2]);
      y.push([dist]);
    }
  }

  const mlr = new MLR(X, y, { intercept: false });
  return mlr.weights.map((w: any) => w[0]);
}

const s200Tk = runRegression(FLEET['FHFNG'].takeoff50ftGrid);
const s200Ld = runRegression(FLEET['FHFNG'].landing50ftGrid);

console.log("S200_TAKEOFF_MLR_WEIGHTS =", s200Tk);
console.log("S200_LANDING_MLR_WEIGHTS =", s200Ld);
