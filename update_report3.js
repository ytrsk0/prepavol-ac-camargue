import fs from 'fs';

let report = fs.readFileSync('src/components/Report.tsx', 'utf8');

report = report.replace(
  />Take-off \(TOLD\)</,
  '>{t("takeoffPerformance")}<'
);

report = report.replace(
  />Landing \(TOLD\)</,
  '>{t("landingPerformance")}<'
);

fs.writeFileSync('src/components/Report.tsx', report);
