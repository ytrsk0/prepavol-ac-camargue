import fs from 'fs';

let locales = fs.readFileSync('src/locales.ts', 'utf8');

locales = locales.replace(
  /aircraftConfiguration: "Aircraft Configuration",/g,
  'aircraftConfiguration: "Configuration",'
);

locales = locales.replace(
  /aircraftConfiguration: "Masse & Centrage",/g,
  'aircraftConfiguration: "Configuration",'
);

fs.writeFileSync('src/locales.ts', locales);
