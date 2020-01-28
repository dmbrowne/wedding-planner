import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const removeGuestsAndGroupsOnWeddingDelete = functions.firestore
  .document("weddings/{weddingId}")
  .onDelete(async (_, context) => {
    const guestSnaps = await admin
      .firestore()
      .collection("guests")
      .where("weddingId", "==", context.params.weddingId)
      .get();
    const groupSnaps = await admin
      .firestore()
      .collection("guestGroups")
      .where("weddingId", "==", context.params.weddingId)
      .get();
    const batch = admin.firestore().batch();
    guestSnaps.forEach(({ id }) => {
      const ref = admin.firestore().doc(`guests/${id}`);
      batch.delete(ref);
    });
    groupSnaps.forEach(({ id }) => {
      const ref = admin.firestore().doc(`guestGroups/${id}`);
      batch.delete(ref);
    });
    try {
      await batch.commit();
      return true;
    } catch (e) {
      return false;
    }
  });
