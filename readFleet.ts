import { initializeApp } from 'firebase/app';
import { getFirestore, getDocs, collection } from 'firebase/firestore';
import { readFileSync } from 'fs';

const firebaseConfig = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function run() {
  const snapshot = await getDocs(collection(db, 'fleet'));
  snapshot.docs.forEach(doc => {
    console.log(`Document: ${doc.id}`);
    console.log(JSON.stringify(doc.data().envelope, null, 2));
  });
  console.log('Done!');
  process.exit(0);
}
run();
