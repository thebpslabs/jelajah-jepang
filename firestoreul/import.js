const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const quizData = require('./database_restoran.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Function to import data
async function importData() {
  console.log('Starting data import...');

  // The outer loop handles the quiz categories
  for (const quizId in quizData.quizAnswers) {
    if (Object.hasOwnProperty.call(quizData.quizAnswers, quizId)) {
      const docData = quizData.quizAnswers[quizId];
      const docRef = db.collection('quizAnswers').doc(quizId);
      
      try {
        await docRef.set(docData);
        console.log(`Successfully imported document: ${quizId}`);
      } catch (error) {
        console.error(`Failed to import document ${quizId}:`, error);
      }
    }
  }

  console.log('Import process finished.');
  process.exit();
}

// Start the import process
importData();