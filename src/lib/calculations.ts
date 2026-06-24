import { PlaneDefinition, FlightPrepData, PerformancePoint } from '../types/aviation';

const FUEL_DENSITY = 0.72;

export function calculateWeightAndBalance(plane: PlaneDefinition, data: FlightPrepData) {
  const mainFuelMass = data.mainfuel * FUEL_DENSITY;
  const wingFuelMass = (data.leftwingfuel + data.rightwingfuel) * FUEL_DENSITY;
  const auxFuelMass = data.auxfuel * FUEL_DENSITY;

  const weights = {
    bew: plane.bew,
    front: data.pax0 + data.pax1,
    rear: data.pax2 + data.pax3,
    baggage: data.baggage,
    baggage2: data.baggage2,
    mainfuel: mainFuelMass,
    wingfuel: wingFuelMass,
    auxfuel: auxFuelMass,
  };

  const moments = {
    bew: weights.bew * plane.arms.bew,
    front: weights.front * plane.arms.front,
    rear: weights.rear * plane.arms.rear,
    baggage: weights.baggage * plane.arms.baggage,
    baggage2: weights.baggage2 * plane.arms.baggage2,
    mainfuel: weights.mainfuel * plane.arms.mainfuel,
    wingfuel: weights.wingfuel * plane.arms.wingfuel,
    auxfuel: weights.auxfuel * plane.arms.auxfuel,
  };

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const totalMoment = Object.values(moments).reduce((a, b) => a + b, 0);
  const cg = totalWeight > 0 ? Math.round((totalMoment / totalWeight) * 100) / 100 : 0;

  // No fuel case for plotting the line
  const totalWeightNoFuel = totalWeight - (mainFuelMass + wingFuelMass + auxFuelMass);
  const totalMomentNoFuel = totalMoment - (moments.mainfuel + moments.wingfuel + moments.auxfuel);
  const cgNoFuel = totalWeightNoFuel > 0 ? Math.round((totalMomentNoFuel / totalWeightNoFuel) * 100) / 100 : 0;

  // Endurance
  const usableMain = Math.max(0, data.mainfuel - (plane.unusable_mainfuel || 0));
  const usableLeftWing = Math.max(0, data.leftwingfuel - (plane.unusable_wingfuel || 0));
  const usableRightWing = Math.max(0, data.rightwingfuel - (plane.unusable_wingfuel || 0));
  const usableAux = Math.max(0, data.auxfuel - (plane.unusable_auxfuel || 0));
  const totalUsableFuel = usableMain + usableLeftWing + usableRightWing + usableAux;
  
  const enduranceHours = Math.max(0, totalUsableFuel / plane.fuelrate);
  // Round down to multiples of 5 minutes
  const enduranceMinutes = Math.floor((enduranceHours * 60) / 5) * 5;
  
  const dayFlyingMinutes = Math.max(0, enduranceMinutes - 30);
  const nightFlyingMinutes = Math.max(0, enduranceMinutes - 45);
  
  return {
    totalWeight,
    totalMoment,
    cg,
    cgNoFuel,
    totalWeightNoFuel,
    enduranceMinutes,
    dayFlyingMinutes,
    nightFlyingMinutes,
    isOverweight: totalWeight > plane.mtow,
    isCgValid: isPointInPolygon([cg, totalWeight], plane.envelope),
    isCgNoFuelValid: isPointInPolygon([cgNoFuel, totalWeightNoFuel], plane.envelope),
  };
}

function isPointInPolygon(point: [number, number], polygon: [number, number][]) {
  if (!polygon || polygon.length < 3) return false;
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export function calculateAltitudes(elevation: number, qnh: number, temp: number) {
  const zp = elevation - 27 * (qnh - 1013);
  const zd = 1.2376 * zp + 118.8 * temp - 1782;
  return { zp, zd };
}

/**
 * Basic Linear Regression implementation (Least Squares)
 */
export function solveLinearRegression(data: { x: number[], y: number }[]) {
  const n = data.length;
  if (n === 0) return null;
  const m = data[0].x.length;
  
  // Matrix X (n x (m+1))
  const X = data.map(d => [1, ...d.x]);
  const Y = data.map(d => d.y);
  
  // X^T * X with Ridge Regularization (lambda = 1e-4) to stabilize singular matrices (like S200)
  // We do not regularize the intercept term (i > 0) to ensure prediction alignment with standard SVD OLS solvers
  const lambda = 1e-4;
  const XT_X = Array.from({ length: m + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= m; i++) {
    for (let j = 0; j <= m; j++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += X[k][i] * X[k][j];
      }
      XT_X[i][j] = sum + (i === j && i > 0 ? lambda : 0);
    }
  }
  
  // X^T * Y
  const XT_Y = new Array(m + 1).fill(0);
  for (let i = 0; i <= m; i++) {
    let sum = 0;
    for (let k = 0; k < n; k++) {
      sum += X[k][i] * Y[k];
    }
    XT_Y[i] = sum;
  }
  
  // Solve using Gaussian elimination with pivoting
  const matrix = XT_X.map((row, i) => [...row, XT_Y[i]]);
  const size = m + 1;
  
  for (let i = 0; i < size; i++) {
    let max = i;
    for (let k = i + 1; k < size; k++) {
      if (Math.abs(matrix[k][i]) > Math.abs(matrix[max][i])) max = k;
    }
    [matrix[i], matrix[max]] = [matrix[max], matrix[i]];
    
    if (Math.abs(matrix[i][i]) < 1e-18) continue; // Skip singular column

    for (let k = i + 1; k < size; k++) {
      const factor = matrix[k][i] / matrix[i][i];
      for (let j = i; j <= size; j++) {
        matrix[k][j] -= factor * matrix[i][j];
      }
    }
  }
  
  const solution = new Array(size).fill(0);
  for (let i = size - 1; i >= 0; i--) {
    if (Math.abs(matrix[i][i]) < 1e-18) {
        // If we have a singular row, we set this variable's effect to 0
        solution[i] = 0;
        continue;
    }
    let sum = 0;
    for (let j = i + 1; j < size; j++) {
      sum += matrix[i][j] * solution[j];
    }
    solution[i] = (matrix[i][size] - sum) / matrix[i][i];
  }
  
  return solution;
}

/**
 * Linear Regression performance prediction based on POH data.
 * Replicates planes.py logic: LinearRegression trained on [ZP, TempK, Weight].
 */
export function predictDistance(
  grid: PerformancePoint[] | undefined,
  mtow: number,
  zp: number,
  tempC: number,
  auw: number,
  operation: 'takeoff' | 'landing',
  planeType: string = ""
) {
  if (!grid || grid.length === 0) {
    return {
      asphalt: [0, 0, 0, 0],
      grass: [0, 0, 0, 0]
    };
  }

  // Prepare training data from raw grid
  const trainingData: { x: number[], y: number }[] = [];
  grid.forEach(point => {
    Object.entries(point.distances).forEach(([wStr, dist]) => {
        const W = Number(wStr);
        const Zp = point.alt;
        const T = point.temp + 273;
        // Exact Degree-2 Polynomial Features to match sklearn PolynomialFeatures(2)
        // Features: [Zp, T, W, Zp^2, Zp*T, Zp*W, T^2, T*W, W^2]
        trainingData.push({
            x: [Zp, T, W, Zp * Zp, Zp * T, Zp * W, T * T, T * W, W * W],
            y: dist
        });
    });
  });

  const coeffs = solveLinearRegression(trainingData);
  let baseDistance = 0;

  if (coeffs) {
      const tempK = tempC + 273;
      const x = [zp, tempK, auw, zp * zp, zp * tempK, zp * auw, tempK * tempK, tempK * auw, auw * auw];
      baseDistance = coeffs[0];
      for(let i = 0; i < x.length; i++) {
        baseDistance += coeffs[i+1] * x[i];
      }
  }
  
  // Ensure we don't return negative distances
  baseDistance = Math.max(0, baseDistance);

  // Headwind and surface adjustment mapping matching original Robin POH factors:
  let headwindCoeffs;
  if (operation === 'takeoff') {
    headwindCoeffs = [1, 0.85, 0.65, 0.55];
  } else {
    headwindCoeffs = [1, 0.78, 0.63, 0.52];
  }
  
  // Surface adjustment matching original Robin POH grass coefficient: 1.15
  const asphaltDistances = headwindCoeffs.map(c => Math.round(baseDistance * c));
  const grassSafeDistances = asphaltDistances.map(d => Math.round(d * 1.15));
  
  // Calculate Zd for density height reference
  const zd = 1.2376 * zp + 118.8 * tempC - 1782;

  return {
    asphalt: asphaltDistances,
    grass: grassSafeDistances,
    rawAsphalt: baseDistance,
    zd,
    modelCoeffs: coeffs,
    trainingPoints: trainingData.length
  };
}
