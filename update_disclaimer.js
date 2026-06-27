import fs from 'fs';
let app = fs.readFileSync('src/App.tsx', 'utf8');

app = app.replace(
  /This tool is an aid for flight preparation\. The Commander \(CDB\) remains solely responsible for the final weight and balance verification\. Always cross-check results with the official Pilot Operating Handbook \(POH\)\./g,
  '{t("flightPrepDisclaimerText")}'
);

fs.writeFileSync('src/App.tsx', app);
