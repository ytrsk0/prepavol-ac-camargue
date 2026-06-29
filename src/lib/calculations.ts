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
 * Interpolates distance linearly across altitude, temperature, and weight.
 * Provides exact point matches when inputs align with the POH grid.
 */
export function interpolateDistance(
  grid: PerformancePoint[] | undefined,
  zp: number,
  tempC: number,
  auw: number
): number {
  if (!grid || grid.length === 0) return 0;

  // 1. Get all unique weights in the grid
  const uniqueWeights = Array.from(new Set(
    grid.flatMap(point => Object.keys(point.distances).map(Number))
  )).sort((a, b) => a - b);

  if (uniqueWeights.length === 0) return 0;

  // Helper function to interpolate for a single fixed weight
  const interpolateForWeight = (w: number): number => {
    // Get unique altitudes in the grid
    const uniqueAlts = Array.from(new Set(grid.map(p => p.alt))).sort((a, b) => a - b);
    if (uniqueAlts.length === 0) return 0;

    // Find the bounding altitudes
    let alt1 = uniqueAlts[0];
    let alt2 = uniqueAlts[uniqueAlts.length - 1];

    if (uniqueAlts.length === 1) {
      alt1 = uniqueAlts[0];
      alt2 = uniqueAlts[0];
    } else if (zp <= uniqueAlts[0]) {
      alt1 = uniqueAlts[0];
      alt2 = uniqueAlts[1];
    } else if (zp >= uniqueAlts[uniqueAlts.length - 1]) {
      alt1 = uniqueAlts[uniqueAlts.length - 2];
      alt2 = uniqueAlts[uniqueAlts.length - 1];
    } else {
      for (let i = 0; i < uniqueAlts.length - 1; i++) {
        if (zp >= uniqueAlts[i] && zp <= uniqueAlts[i + 1]) {
          alt1 = uniqueAlts[i];
          alt2 = uniqueAlts[i + 1];
          break;
        }
      }
    }

    // Helper to interpolate temperature for a given altitude and weight
    const getDistAtAlt = (targetAlt: number): number => {
      // Find all points at this altitude
      const pointsAtAlt = grid.filter(p => p.alt === targetAlt);
      if (pointsAtAlt.length === 0) return 0;

      // Sort points by temperature
      const sortedPoints = [...pointsAtAlt].sort((a, b) => a.temp - b.temp);
      const temps = sortedPoints.map(p => p.temp);

      let t1 = temps[0];
      let t2 = temps[temps.length - 1];

      let p1 = sortedPoints[0];
      let p2 = sortedPoints[sortedPoints.length - 1];

      if (sortedPoints.length === 1) {
        p1 = sortedPoints[0];
        p2 = sortedPoints[0];
      } else if (tempC <= t1) {
        p1 = sortedPoints[0];
        p2 = sortedPoints[1];
      } else if (tempC >= t2) {
        p1 = sortedPoints[sortedPoints.length - 2];
        p2 = sortedPoints[sortedPoints.length - 1];
      } else {
        for (let i = 0; i < sortedPoints.length - 1; i++) {
          if (tempC >= sortedPoints[i].temp && tempC <= sortedPoints[i+1].temp) {
            p1 = sortedPoints[i];
            p2 = sortedPoints[i + 1];
            break;
          }
        }
      }

      const d1 = p1.distances[w] !== undefined ? p1.distances[w] : 0;
      const d2 = p2.distances[w] !== undefined ? p2.distances[w] : 0;

      if (p1.temp === p2.temp) return d1;
      const t_factor = (tempC - p1.temp) / (p2.temp - p1.temp);
      return d1 + t_factor * (d2 - d1);
    };

    const d_alt1 = getDistAtAlt(alt1);
    const d_alt2 = getDistAtAlt(alt2);

    if (alt1 === alt2) return d_alt1;
    const alt_factor = (zp - alt1) / (alt2 - alt1);
    return d_alt1 + alt_factor * (d_alt2 - d_alt1);
  };

  // Find bounding weights
  let w1 = uniqueWeights[0];
  let w2 = uniqueWeights[uniqueWeights.length - 1];

  if (uniqueWeights.length === 1) {
    w1 = uniqueWeights[0];
    w2 = uniqueWeights[0];
  } else if (auw <= w1) {
    w1 = uniqueWeights[0];
    w2 = uniqueWeights[1];
  } else if (auw >= w2) {
    w1 = uniqueWeights[uniqueWeights.length - 2];
    w2 = uniqueWeights[uniqueWeights.length - 1];
  } else {
    for (let i = 0; i < uniqueWeights.length - 1; i++) {
      if (auw >= uniqueWeights[i] && auw <= uniqueWeights[i + 1]) {
        w1 = uniqueWeights[i];
        w2 = uniqueWeights[i + 1];
        break;
      }
    }
  }

  const d_w1 = interpolateForWeight(w1);
  const d_w2 = interpolateForWeight(w2);

  if (w1 === w2) return d_w1;
  const w_factor = (auw - w1) / (w2 - w1);
  return d_w1 + w_factor * (d_w2 - d_w1);
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

  // Prepare training data from raw grid for first-degree coefficients
  const trainingData: { x: number[], y: number }[] = [];
  grid.forEach(point => {
    Object.entries(point.distances).forEach(([wStr, dist]) => {
        const W = Number(wStr);
        const Zp = point.alt;
        const T = point.temp + 273;
        // First-degree features: [Zp, T, W]
        trainingData.push({
            x: [Zp, T, W],
            y: dist
        });
    });
  });

  const coeffs = solveLinearRegression(trainingData);

  // Use the 100% exact multi-linear interpolation for the base distance
  const baseDistance = Math.max(0, interpolateDistance(grid, zp, tempC, auw));

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

