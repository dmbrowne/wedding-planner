import * as functions from "firebase-functions";
import { modifyAlgoliaDocument } from "./utils";
import * as admin from "firebase-admin";

interface IGuest {
  id: string;
  name: string;
  email?: string;
  weddingId: string;
  preferredName?: string;
  partnerId?: string;
  groupIds?: string[];
}

function addMemberIdToExistingGuestGroups(groupIds: string[], memberId: string) {
  return groupIds.map(groupId => {
    const ref = admin.firestore().doc(`guestGroups/${groupId}`);
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

function removeMemberIdFromExistingGuestGroups(groupIds: string[], memberId: string) {
  return groupIds.map(groupId => {
    const ref = admin.firestore().doc(`guestGroups/${groupId}`);
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

export const modifyAlgoliaGuestGroup = functions.firestore.document("guestGroups/{groupId}").onWrite(change => {
  return modifyAlgoliaDocument<IGuest>("guestGroups", change);
});

export const updateGuestGroupMemberIdsOnGuestUpdate = functions.firestore
  .document("guests/{guestId}")
  .onUpdate(({ before, after }) => {
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
        ? removeMemberIdFromExistingGuestGroups(removedGroupIds, after.id)
        : [Promise.resolve()];

      const addToGroups = !addedGroupIds.length
        ? addMemberIdToExistingGuestGroups(addedGroupIds, after.id)
        : [Promise.resolve()];

      return Promise.all([...removeFromGroups, ...addToGroups]);
    } else if (!bfreGroupIds && aftrGroupIds) {
      addMemberIdToExistingGuestGroups(aftrGroupIds, after.id);
    } else if (bfreGroupIds && !aftrGroupIds) {
      addMemberIdToExistingGuestGroups(bfreGroupIds, after.id);
    }

    return true;
  });

export const addMemberIdToGuestGroupOnCreateGuest = functions.firestore.document("guests/{guestId}").onCreate(snap => {
  const { groupIds } = snap.data() as { groupIds?: string[] };
  const updates = groupIds ? addMemberIdToExistingGuestGroups(groupIds, snap.id) : [Promise.resolve()];

  return Promise.all(updates);
});

export const removeMemberIdFromGuestGroupOnGuestDelete = functions.firestore
  .document("guests/{guestId}")
  .onDelete(snap => {
    const { groupIds } = snap.data() as { id: string; groupIds?: string[] };
    const updates = groupIds ? removeMemberIdFromExistingGuestGroups(groupIds, snap.id) : [Promise.resolve()];

    return Promise.all(updates);
  });
