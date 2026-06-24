import { execSync } from 'child_process';
try {
  console.log("Downloading get-pip.py...");
  execSync('curl -sS https://bootstrap.pypa.io/get-pip.py -o get-pip.py', { stdio: 'inherit' });
  console.log("Installing pip...");
  execSync('python3 get-pip.py --user', { stdio: 'inherit' });
  console.log("Installing pandas, scikit-learn, numpy, pyyaml, matplotlib, shapely...");
  execSync('python3 -m pip install --user pandas scikit-learn numpy pyyaml matplotlib shapely', { stdio: 'inherit' });
  console.log("Running test...");
  const out = execSync('python3 test_py_targets.py');
  console.log(out.toString());
} catch (e: any) {
  console.log("Error:", e.message);
}
