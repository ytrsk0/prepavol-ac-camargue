import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  /label="Pilot \(L\)"/g,
  'label={t("pilotL")}'
);

app = app.replace(
  /label="Pax Front \(R\)"/g,
  'label={t("paxFrontR")}'
);

app = app.replace(
  /label="Pax Rear \(L\)"/g,
  'label={t("paxRearL")}'
);

app = app.replace(
  /label="Pax Rear \(R\)"/g,
  'label={t("paxRearR")}'
);

app = app.replace(
  /label="Baggage 1"/g,
  'label={t("baggage1")}'
);

app = app.replace(
  /label="Baggage 2"/g,
  'label={t("baggage2")}'
);

app = app.replace(
  /label="Main Tank"/g,
  'label={t("mainTank")}'
);

app = app.replace(
  /label="Left Wing"/g,
  'label={t("leftWing")}'
);

app = app.replace(
  /label="Right Wing"/g,
  'label={t("rightWing")}'
);

app = app.replace(
  /label="Auxiliary"/g,
  'label={t("auxiliary")}'
);

app = app.replace(
  /label="Loaded CG"/g,
  'label={t("loadedCg")}'
);

app = app.replace(
  /label="Zero Fuel CG"/g,
  'label={t("zeroFuelCg")}'
);

app = app.replace(
  /subValue="Full Fuel"/g,
  'subValue={t("fullFuel")}'
);

app = app.replace(
  /subValue="Post-Flight"/g,
  'subValue={t("postFlight")}'
);

fs.writeFileSync('src/App.tsx', app);
