import { FLEET } from './src/data/fleet';
import { predictDistance, solveLinearRegression } from './src/lib/calculations';

const performanceTargets = [
  { auw: 709.5, alt: 0, tempC: 15, qnh: 1013, target: 289 },
  { auw: 709.5, alt: 0, tempC: 40, qnh: 1013, target: 359 },
  { auw: 709.5, alt: 8000, tempC: 10, qnh: 1013, target: 638 },
  { auw: 900, alt: 8000, tempC: 10, qnh: 1013, target: 935 },
];

function testAircraft(label: string, aircraftId: string) {
  console.log(`\n--- Testing ${label} (${aircraftId}) ---`);
  const aircraft = FLEET[aircraftId];
  if (!aircraft) {
    console.log(`Aircraft ${aircraftId} not found in FLEET.`);
    return;
  }

  performanceTargets.forEach((t, i) => {
    // Replicating zp calculation from planes.py: elevation - 27 * (qnh - 1013)
    const zp = t.alt - 27 * (t.qnh - 1013);
    const result = predictDistance(
      aircraft.takeoff50ftGrid,
      aircraft.mtow,
      zp,
      t.tempC,
      t.auw,
      'takeoff',
      aircraft.planetype
    );
    
    // Internal debug
    const grid = aircraft.takeoff50ftGrid!;
    const trainingData: any[] = [];
    grid.forEach(point => {
        Object.entries(point.distances).forEach(([wStr, dist]) => {
            trainingData.push({
                x: [point.alt, point.temp + 273, Number(wStr)],
                y: dist
            });
        });
    });
    const coeffs1 = solveLinearRegression(trainingData);
    
    // Test Degree 2 manually
    const trainingData2 = trainingData.map(d => ({
        x: [
            d.x[0], d.x[1], d.x[2], // raw
            d.x[0]*d.x[0], d.x[1]*d.x[1], d.x[2]*d.x[2], // squared
            d.x[0]*d.x[1], d.x[0]*d.x[2], d.x[1]*d.x[2] // interactions
        ],
        y: d.y
    }));
    const coeffs2 = solveLinearRegression(trainingData2);
    
    let pred2 = 0;
    if (coeffs2) {
      const tempK = t.tempC + 273;
      const x2 = [
        zp, tempK, t.auw,
        zp*zp, tempK*tempK, t.auw*t.auw,
        zp*tempK, zp*t.auw, tempK*t.auw
      ];
      pred2 = coeffs2[0];
      for (let j = 0; j < x2.length; j++) {
        pred2 += coeffs2[j+1] * x2[j];
      }
    }
    
    const prediction = result.asphalt[0]; // 0kt headwind
    const diff = prediction - t.target;
    console.log(`Target ${i+1}: AUW=${t.auw}kg, Alt=${t.alt}ft, Temp=${t.tempC}C`);
    console.log(`  Pred: ${Math.round(prediction)}m | Target: ${t.target}m | Diff: ${Math.round(diff)}m`);
    console.log(`  Degree 2 Pred: ${Math.round(pred2)}m | Diff: ${Math.round(pred2 - t.target)}m`);
  });
}

testAircraft("FBUPS (DR400-140B)", "FBUPS");

console.log("\nChecking DR400-140 (FBXEQ)...");
testAircraft("FBXEQ (DR400-140)", "FBXEQ");

console.log("\nChecking DR400-120 (FGGXD)...");
testAircraft("FGGXD (DR400-120)", "FGGXD");
