import { create, all } from 'mathjs';
import { FLEET } from './src/data/fleet';

const math = create(all);

function makePolynomialFeatures(pt: number[]): number[] {
  // [1, a, t, m, a^2, a*t, a*m, t^2, t*m, m^2]
  const [a, t, m] = pt;
  return [1, a, t, m, a*a, a*t, a*m, t*t, t*m, m*m];
}

function solvePolyRegression(grid: any) {
  const X: number[][] = [];
  const y: number[] = [];

  for (const pt of grid) {
    for (const wStr of Object.keys(pt.distances)) {
      const w = Number(wStr);
      const d = pt.distances[w];
      const a = pt.alt;
      const tk = pt.temp + 273;
      X.push(makePolynomialFeatures([a, tk, w]));
      y.push(d);
    }
  }

  const X_mat = math.matrix(X);
  const y_mat = math.matrix(y);
  const X_T = math.transpose(X_mat);

  // inv(X^T * X) * X^T * Y
  // use pseudo-inverse if singular, or just try inv
  try {
     const XtX = math.multiply(X_T, X_mat);
     const invXtX = math.inv(XtX);
     const XtY = math.multiply(X_T, y_mat);
     const beta = math.multiply(invXtX, XtY);
     return beta.toArray();
  } catch (e) {
     console.error(e);
     return null;
  }
}

const plane = FLEET['FHFNG'];
const tkGrid = plane.takeoff50ftGrid;
const ldGrid = plane.landing50ftGrid;

const betaTk = solvePolyRegression(tkGrid);
const betaLd = solvePolyRegression(ldGrid);

console.log("betaTk:", betaTk);
console.log("betaLd:", betaLd);

function predict(beta: number[], a: number, tempC: number, m: number) {
  const feats = makePolynomialFeatures([a, tempC + 273, m]);
  let val = 0;
  for (let i = 0; i < beta.length; ++i) {
    val += beta[i] * feats[i];
  }
  return val;
}

const pTk = predict(betaTk as number[], 0, 15, 750);
const pLd = predict(betaLd as number[], 0, 15, 750);

console.log("Poly regression prediction S200 TO at 0ft, 15C, 750kg:", pTk);
console.log("Poly regression prediction S200 LD at 0ft, 15C, 750kg:", pLd);
