import fs from 'fs';

let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  /label="All-Up Weight"/g,
  'label={t("allUpWeight")}'
);

app = app.replace(
  /title="Take-off Performance"/g,
  'title={t("takeoffPerformance")}'
);

app = app.replace(
  /title="Landing Performance"/g,
  'title={t("landingPerformance")}'
);

fs.writeFileSync('src/App.tsx', app);
