import * as functions from "firebase-functions";
import { modifyAlgoliaDocument } from "./utils";
import * as admin from "firebase-admin";

export const modifyAlgoliaGuest = functions.firestore.document("guests/{guestId}").onWrite(change => {
  return modifyAlgoliaDocument("guests", change, data => {
    data.hasPartner = !!data.partnerId;
    data.hasEmail = !!data.email;
    return data;
  });
});

export const updatePartnerOnGuestCreateOrDelete = functions.firestore.document("guests/{guestId}").onWrite(async ({ before, after }) => {
  const isDeleteOperation = before.exists && !after.exists;
  const isCreareOperation = !before.exists && after.exists;
  const { partnerId } = after.data() as any;

  if (!partnerId || (!isDeleteOperation && !isCreareOperation)) {
    return true;
  }

  const partner = await admin
    .firestore()
    .doc(`guests/${partnerId}`)
    .get();

  if (!partner.exists) {
    return false;
  }
  if (!!(partner.data() as any).partnerId) {
    return false;
  }
  try {
    await (isCreareOperation ? partner.ref.update({ partnerId: after.id }) : partner.ref.update({ partnerId: null }));
    return true;
  } catch (e) {
    return e;
  }
});

export const updateEventGuestNameOnGuestNameChange = functions.firestore.document("guests/{guestId}").onUpdate((change, { params }) => {
  const newName = (change.after.data() as any).name;
  const db = admin.firestore();
  if ((change.before.data() as any).name === newName) return true;

  return db
    .collection("eventGuests")
    .where("guestId", "==", params.guestId)
    .get()
    .then(snap => {
      const batch = db.batch();
      snap.docs.forEach(doc => batch.update(doc.ref, { name: newName }));
      return batch.commit();
    });
});
