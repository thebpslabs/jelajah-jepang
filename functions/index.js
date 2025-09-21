const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.submitScore = functions.https.onCall(async (data, context) => {
  // Checkpoint 1: Authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "[DIAGNOSTIC] Error: User is not authenticated."
    );
  }

  const { quizId, userAnswers } = data;
  const userId = context.auth.uid;
  const userName = context.auth.token.name || "Anonim";

  if (!quizId) {
      throw new functions.https.HttpsError("invalid-argument", "[DIAGNOSTIC] Error: quizId was not sent from the app.");
  }

  let quizDoc;
  try {
    // Checkpoint 2: Reading from Firestore
    const quizDocRef = admin.firestore().collection("quizAnswers").doc(quizId);
    quizDoc = await quizDocRef.get();
  } catch (error) {
    throw new functions.https.HttpsError("internal", `[DIAGNOSTIC] Error reading from Firestore: ${error.message}`);
  }

  // Checkpoint 3: Document Existence
  if (!quizDoc.exists) {
    throw new functions.https.HttpsError(
      "not-found",
      `[DIAGNOSTIC] Error: Document with ID '${quizId}' was not found in the 'quizAnswers' collection.`
    );
  }

  const correctAnswersData = quizDoc.data().answers;

  // Checkpoint 4: Data format inside the document
  if (!correctAnswersData || !Array.isArray(correctAnswersData)) {
      throw new functions.https.HttpsError("internal", "[DIAGNOSTIC] Error: Document exists, but the 'answers' field is missing or is not an array.");
  }


  // Recalculate the score securely on the server.
  let score = 0;
  let correctAnswersCount = 0;
  let comboStreak = 0;
  
  const level = quizId.split('_')[1];
  let basePoints = 100;
  if (level === 'level2') {
    basePoints = 125;
  } else if (level === 'level3') {
    basePoints = 150;
  }

  const correctAnswersMap = new Map(
    correctAnswersData.map((q) => [q.question, q.correct])
  );

  userAnswers.forEach((userAnswer) => {
    const correctAnswer = correctAnswersMap.get(userAnswer.question);
    if (userAnswer.userAnswer === correctAnswer) {
      correctAnswersCount++;
      comboStreak++;
      let comboBonus = (comboStreak >= 2) ? (comboStreak - 1) * 10 : 0;
      score += basePoints + comboBonus;
    } else {
      comboStreak = 0;
    }
  });

  // Checkpoint 5: Writing to the leaderboard
  try {
    const leaderboardRef = admin.firestore().collection("globalLeaderboard");
    await leaderboardRef.add({
      userId: userId,
      name: userName,
      score: score,
      quizId: quizId,
      correctAnswers: correctAnswersCount,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch(error) {
      throw new functions.https.HttpsError("internal", `[DIAGNOSTIC] Error writing to the leaderboard: ${error.message}`);
  }

  return { status: "sukses", message: "Skor berhasil dikirim!", score };
});