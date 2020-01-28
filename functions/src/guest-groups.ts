import * as functions from "firebase-functions";
import { modifyAlgoliaDocument } from "./utils";
import * as admin from "firebase-admin";

interface IGuest {
  id: string;
  name: string;
  email?: string;
  preferredName?: string;
  partnerId?: string;
  groupIds?: string[];
}

function addMemberIdToExistingGuestGroups(groupIds: string[], memberId: string, weddingId: string) {
  return groupIds.map(groupId => {
    const ref = admin.firestore().doc(`weddings/${weddingId}/guestGroups/${groupId}`);
    return admin.firestore().runTransaction(function(transaction) {
      return transaction.get(ref).then(doc => {
        if (!doc.exists) {
          return Promise.resolve();
        }
        transaction.update(ref, { members: admin.firestore.FieldValue.arrayRemove(memberId) });
        return Promise.resolve();
      });
    });
  });
}

function removeMemberIdFromExistingGuestGroups(groupIds: string[], memberId: string, weddingId: string) {
  return groupIds.map(groupId => {
    const ref = admin.firestore().doc(`weddings/${weddingId}/guestGroups/${groupId}`);
    return admin.firestore().runTransaction(function(transaction) {
      return transaction.get(ref).then(doc => {
        if (!doc.exists) {
          return Promise.resolve();
        }
        transaction.update(ref, { members: admin.firestore.FieldValue.arrayRemove(memberId) });
        return Promise.resolve();
      });
    });
  });
}

export const modifyAlgoliaGuestGroup = functions.firestore
  .document("weddings/{weddingId}/guestGroups/{groupId}")
  .onWrite((change, { params }) => {
    return modifyAlgoliaDocument<IGuest>("guestGroups", change, params.weddingId);
  });

export const updateGuestGroupMemberIdsOnGuestUpdate = functions.firestore
  .document("weddings/{weddingId}/guests/{guestId}")
  .onUpdate(({ before, after }, context) => {
    const { groupIds: bfreGroupIds } = before.data() as IGuest;
    const { groupIds: aftrGroupIds } = after.data() as IGuest;

    if (bfreGroupIds && aftrGroupIds) {
      const areAllValuesEqual = aftrGroupIds.every((groupId, idx) => groupId === bfreGroupIds[idx]);
      if (areAllValuesEqual) {
        return true;
      }
      const removedGroupIds = bfreGroupIds.filter(x => !aftrGroupIds.includes(x));
      const addedGroupIds = aftrGroupIds.filter(x => !bfreGroupIds.includes(x));

      const removeFromGroups = !removedGroupIds.length
        ? removeMemberIdFromExistingGuestGroups(removedGroupIds, context.params.weddingId, after.id)
        : [Promise.resolve()];

      const addToGroups = !addedGroupIds.length
        ? addMemberIdToExistingGuestGroups(addedGroupIds, context.params.weddingId, after.id)
        : [Promise.resolve()];

      return Promise.all([...removeFromGroups, ...addToGroups]);
    } else if (!bfreGroupIds && aftrGroupIds) {
      addMemberIdToExistingGuestGroups(aftrGroupIds, context.params.weddingId, after.id);
    } else if (bfreGroupIds && !aftrGroupIds) {
      addMemberIdToExistingGuestGroups(bfreGroupIds, context.params.weddingId, after.id);
    }

    return true;
  });

export const addMemberIdToGuestGroupOnCreateGuest = functions.firestore
  .document("weddings/{weddingId}/guests/{guestId}")
  .onCreate((snap, cntxt) => {
    const { groupIds } = snap.data() as { groupIds?: string[] };
    const updates = groupIds
      ? addMemberIdToExistingGuestGroups(groupIds, cntxt.params.weddingId, snap.id)
      : [Promise.resolve()];

    return Promise.all(updates);
  });

export const removeMemberIdFromGuestGroupOnGuestDelete = functions.firestore
  .document("weddings/{weddingId}/guests/{guestId}")
  .onDelete((snap, cntxt) => {
    const { groupIds } = snap.data() as { id: string; groupIds?: string[] };
    const updates = groupIds
      ? removeMemberIdFromExistingGuestGroups(groupIds, cntxt.params.weddingId, snap.id)
      : [Promise.resolve()];

    return Promise.all(updates);
  });
