import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const createUserOnAccountCreate = functions.auth.user().onCreate(user => {
  const db = admin.firestore();
  const batch = db.batch();
  const { uid, email, displayName } = user;

  batch.set(db.doc(`users/${uid}`), { email, name: displayName, accountType: "normal" });
  batch.set(db.doc(`userEmails/${email}`), { userId: uid });

  return batch.commit();
});

export const doesAccountExist = functions.https.onCall(async data => {
  const db = admin.firestore();
  const { email } = data;

  if (!email) throw new functions.https.HttpsError("invalid-argument", "email is a required");

  const { exists } = await db.doc(`userEmails/${email}`).get();

  return exists;
});
