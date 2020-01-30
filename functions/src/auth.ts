import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const createUserOnAccountCreate = functions.auth.user().onCreate(user => {
  return admin
    .firestore()
    .doc(`users/${user.uid}`)
    .set({
      email: user.email,
      name: user.displayName
    });
});
