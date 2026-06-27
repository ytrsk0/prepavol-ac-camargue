import fs from 'fs';

let locales = fs.readFileSync('src/locales.ts', 'utf8');

locales = locales.replace(
  '    temperature: "Temperature",',
  '    temperature: "Temperature",\n    pilotL: "Pilot (L)",\n    paxFrontR: "Pax Front (R)",\n    paxRearL: "Pax Rear (L)",\n    paxRearR: "Pax Rear (R)",\n    mainTank: "Main Tank",\n    leftWing: "Left Wing",\n    rightWing: "Right Wing",\n    loadedCg: "Loaded CG",\n    zeroFuelCg: "Zero Fuel CG",\n    fullFuel: "Full Fuel",\n    postFlight: "Post-Flight",'
);

locales = locales.replace(
  '    temperature: "Température",',
  '    temperature: "Température",\n    pilotL: "Pilote",\n    paxFrontR: "Pax AV",\n    paxRearL: "Pax AR (G)",\n    paxRearR: "Pax AR (D)",\n    mainTank: "Principal",\n    leftWing: "Aile G.",\n    rightWing: "Aile D.",\n    loadedCg: "CG chargé",\n    zeroFuelCg: "CG zéro fuel",\n    fullFuel: "Plein de carburant",\n    postFlight: "Après-vol",'
);

locales = locales.replace(
  'environmentalConditions: "Environmental Conditions",',
  'environmentalConditions: "Performances",'
);

locales = locales.replace(
  /aircraftConfiguration: "Configuration de l'aéronef",/,
  'aircraftConfiguration: "Masse & Centrage",'
);

locales = locales.replace(
  /selectAircraft: "Choisir un aéronef",/,
  'selectAircraft: "Aéronef",'
);

locales = locales.replace(
  /allUpWeight: "Masse Totale",/,
  'allUpWeight: "Masse totale",'
);

locales = locales.replace(
  /baggage1: "Bagage 1",\n    baggage2: "Bagage 2",/,
  'baggage1: "Bagage",\n    baggage2: "Bagage 2",'
);

locales = locales.replace(
  /auxiliary: "Auxiliary Fuel",/,
  'auxiliary: "Auxiliary",'
);

locales = locales.replace(
  /auxFuel: "Réservoir auxiliaire",/,
  'auxFuel: "Réservoir auxiliaire",\n    auxiliary: "Auxilliaire",'
);

locales = locales.replace(
  /takeoffPerformance: "Performances de décollage",/,
  'takeoffPerformance: "Distance de décollage",'
);

locales = locales.replace(
  /landingPerformance: "Performances d'atterrissage",/,
  'landingPerformance: "Distance d\'atterrissage",'
);

locales = locales.replace(
  /flightPrepDisclaimerText: "Ce logiciel est un outil complémentaire et NE REMPLACE PAS le manuel de vol \(POH\) officiel\. Le commandant de bord \(CdB\) est ultimement responsable de la vérification de tous les calculs et de l'utilisation de l'aéronef dans ses limites certifiées\.",/,
  'flightPrepDisclaimerText: "Cet outil est une aide à la préparation du vol. Le CDB est responsable de la vérification du bilan de masse et centrage. Le manuel du vol du constructeur demeure la seule référence officielle.",'
);

locales = locales.replace(
  /flightPrepDisclaimerText: "This software is a supplementary tool and DOES NOT replace the official Pilot Operating Handbook \(POH\)\. The Pilot in Command \(PIC\) is ultimately responsible for verifying all calculations and ensuring the aircraft is operated within its certified limitations\.",/,
  'flightPrepDisclaimerText: "This tool is an aid for flight preparation. The Commander (CDB) remains solely responsible for the final weight and balance verification. Always cross-check results with the official Pilot Operating Handbook (POH).",'
);

fs.writeFileSync('src/locales.ts', locales);
