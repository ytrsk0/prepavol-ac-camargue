import fs from 'fs';
let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(
  /50ft \(Asphalt\)/g,
  '{t("distance50ft")} ({t("asphalt")})'
);
app = app.replace(
  /50ft \(Grass x1\.15\)/g,
  '{t("distance50ft")} ({t("grass")})'
);
fs.writeFileSync('src/App.tsx', app);

let report = fs.readFileSync('src/components/Report.tsx', 'utf8');
report = report.replace(
  /50ft \(Asphalt\)/g,
  '{t("distance50ft")} ({t("asphalt")})'
);
report = report.replace(
  /50ft \(Grass x1\.15\)/g,
  '{t("distance50ft")} ({t("grass")})'
);
fs.writeFileSync('src/components/Report.tsx', report);

let locales = fs.readFileSync('src/locales.ts', 'utf8');
locales = locales.replace(
  /asphalt: "Piste en dur",/g,
  'asphalt: "Asphalte",'
);
locales = locales.replace(
  /grass: "Piste en herbe \(x1\.15\)",/g,
  'grass: "Herbe",'
);
locales = locales.replace(
  /asphalt: "Asphalt",/g,
  'asphalt: "Asphalt",'
);
locales = locales.replace(
  /grass: "Grass \(x1\.15\)",/g,
  'grass: "Grass",'
);
fs.writeFileSync('src/locales.ts', locales);
