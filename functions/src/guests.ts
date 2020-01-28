import * as functions from "firebase-functions";
import { modifyAlgoliaDocument } from "./utils";
import * as admin from "firebase-admin";

export const modifyAlgoliaGuest = functions.firestore
  .document("weddings/{weddingId}/guests/{guestId}")
  .onWrite((change, { params }) => {
    return modifyAlgoliaDocument("guests", change, params.weddingId, data => {
      data.hasPartner = !!data.partnerId;
      data.hasEmail = !!data.email;
      return data;
    });
  });

export const removeGroupIdFromGuestOnGroupDelete = functions.firestore
  .document("weddings/{weddingId}/guestGroups/{groupId}")
  .onDelete((snap, cntxt) => {
    const { members } = snap.data() as { members?: string[] };
    const updates = members
      ? members.map(guestId => {
          const ref = admin.firestore().doc(`weddings/${cntxt.params.weddingId}/guests/${guestId}`);
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
  .document("weddings/{weddingId}/guests/{guestId}")
  .onWrite(async ({ before, after }, context) => {
    const isDeleteOperation = before.exists && !after.exists;
    const isCreareOperation = !before.exists && after.exists;
    const { partnerId } = after.data() as any;

    if (!partnerId || (!isDeleteOperation && !isCreareOperation)) {
      return true;
    }

    const partner = await admin
      .firestore()
      .doc(`weddings/${context.params.weddingId}/guests/${partnerId}`)
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
