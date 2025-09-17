const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.submitScore = functions.https.onCall(async (data, context) => {
  // 1. Check if the user is authenticated.
  if (!context.auth) {
    // DITERJEMAHKAN: Pesan error jika pengguna tidak login
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Anda harus login untuk mengirimkan skor."
    );
  }

  const { quizId, userAnswers } = data;
  const userId = context.auth.uid;
  // DITERJEMAHKAN: Nama default jika tidak ada
  const userName = context.auth.token.name || "Anonim";

  // 2. Get the correct answers from Firestore to prevent cheating.
  const quizDocRef = admin.firestore().collection("quizAnswers").doc(quizId);
  const quizDoc = await quizDocRef.get();

  if (!quizDoc.exists) {
    // DITERJEMAHKAN: Pesan error jika kuis tidak ditemukan
    throw new functions.https.HttpsError(
      "not-found",
      "Kuis yang dipilih tidak ditemukan."
    );
  }

  const correctAnswersData = quizDoc.data().answers;
  const correctAnswersMap = new Map(
    correctAnswersData.map((q) => [q.question, q.correct])
  );

  // 3. Recalculate the score securely on the server.
  let score = 0;
  let correctAnswersCount = 0;
  let comboStreak = 0;

  // Determine points based on level from quizId (e.g., 'restoran_level1')
  const level = quizId.split('_')[1];
  let basePoints = 100;
  if (level === 'level2') {
    basePoints = 125;
  } else if (level === 'level3') {
    basePoints = 150;
  }

  userAnswers.forEach((userAnswer) => {
    const correctAnswer = correctAnswersMap.get(userAnswer.question);
    if (userAnswer.userAnswer === correctAnswer) {
      correctAnswersCount++;
      comboStreak++;
      
      let comboBonus = 0;
      if (comboStreak >= 2) {
          comboBonus = (comboStreak - 1) * 10;
      }
      
      score += basePoints + comboBonus;
    } else {
      comboStreak = 0;
    }
  });

  // 4. Save the new, verified score to the global leaderboard.
  const leaderboardRef = admin.firestore().collection("globalLeaderboard");

  await leaderboardRef.add({
    userId: userId,
    name: userName,
    score: score,
    quizId: quizId,
    correctAnswers: correctAnswersCount,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  // DITERJEMAHKAN: Pesan sukses
  return { status: "sukses", message: "Skor berhasil dikirim!", score };
});