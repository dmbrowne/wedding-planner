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

export const removeGroupIdFromGuestOnGroupDelete = functions.firestore
  .document("guestGroups/{groupId}")
  .onDelete(snap => {
    const { members } = snap.data() as { members?: string[] };
    const updates = members
      ? members.map(guestId => {
          const ref = admin.firestore().doc(`guests/${guestId}`);
          return admin.firestore().runTransaction(function(transaction) {
            return transaction.get(ref).then(doc => {
              if (!doc.exists) {
                return Promise.resolve();
              }
              transaction.update(ref, { groupIds: admin.firestore.FieldValue.arrayRemove(snap.id) });
              return Promise.resolve();
            });
          });
        })
      : [Promise.resolve()];
    return Promise.all(updates);
  });

export const updatePartnerOnGuestCreateOrDelete = functions.firestore
  .document("guests/{guestId}")
  .onWrite(async ({ before, after }) => {
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
      await (isDeleteOperation ? partner.ref.update({ partnerId: after.id }) : partner.ref.update({ partnerId: null }));
      return true;
    } catch (e) {
      return e;
    }
  });
