import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { FLEET } from './src/data/fleet';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  for (const [callsign, data] of Object.entries(FLEET)) {
    console.log(`Setting ${callsign}...`);
    await setDoc(doc(db, 'fleet', callsign), data);
  }
  console.log('Done!');
  process.exit(0);
}
run();
