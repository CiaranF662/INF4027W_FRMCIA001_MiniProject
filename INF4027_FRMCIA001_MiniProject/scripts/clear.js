// scripts/clear.js
//
// Wipes all ReVibe SA data from Firestore and Firebase Auth.
// Run with: npm run clear
// To wipe and immediately reseed: npm run clear && npm run seed

const admin = require('firebase-admin');
const path  = require('path');

const serviceAccount = require(path.join(__dirname, '..', 'serviceAccountKey.json'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db   = admin.firestore();
const auth = admin.auth();

// Deletes every document in a Firestore collection
async function clearCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  if (snapshot.empty) {
    console.log(`  ~ ${collectionName}: already empty`);
    return;
  }

  // Delete in batches of 500 (Firestore batch limit)
  const batches = [];
  let batch = db.batch();
  let count = 0;

  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
    count++;
    if (count === 500) {
      batches.push(batch.commit());
      batch = db.batch();
      count = 0;
    }
  });

  if (count > 0) batches.push(batch.commit());
  await Promise.all(batches);

  console.log(`  ✓ Cleared ${snapshot.size} documents from ${collectionName}`);
}

// Deletes all Firebase Auth users
async function clearAuthUsers() {
  const listResult = await auth.listUsers();
  if (listResult.users.length === 0) {
    console.log('  ~ auth users: already empty');
    return;
  }

  const uids = listResult.users.map(u => u.uid);
  await auth.deleteUsers(uids);
  console.log(`  ✓ Deleted ${uids.length} auth users`);
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ReVibe SA — Clear Database');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    console.log('Clearing Firestore collections...');
    await clearCollection('products');
    await clearCollection('categories');
    await clearCollection('orders');
    await clearCollection('users');

    console.log('\nClearing Firebase Auth users...');
    await clearAuthUsers();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Database cleared successfully.');
    console.log('  Run "npm run seed" to repopulate.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Clear failed:', error);
    process.exit(1);
  }
}

main();
