import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { modifyAlgoliaDocument } from "./utils";

type TFirestoreSnapShot = admin.firestore.DocumentSnapshot<admin.firestore.DocumentData>;
export const modifyAlgoliaGroup = functions.firestore
  .document("events/{eventId}/guestGroups/{groupId}")
  .onWrite(change => {
    return modifyAlgoliaDocument("guestGroups", change, async data => {
      const db = admin.firestore();

      if (data.memberIds && data.memberIds.length > 0) {
        const fetchEventGuests: Promise<TFirestoreSnapShot>[] = data.memberIds.map((eventGuestId: string) =>
          db.doc(`eventGuests/${eventGuestId}`).get()
        );
        const eventGuests = await Promise.all(fetchEventGuests);
        const names = eventGuests.reduce(
          (accum: string[], snap) => (snap.exists ? [...accum, (snap.data() as any).name] : accum),
          []
        );
        data.memberNames = names;
      }

      return data;
    });
  });

export const remvoveGroupIdFromEventGuestsOnGroupDelete = functions.firestore
  .document("events/{eventId}/guestGroups/{groupId}")
  .onDelete(async snap => {
    const db = admin.firestore();
    const group = snap.data() as any;
    if (group.memberIds && Array.isArray(group.memberIds)) {
      const batch = db.batch();
      group.memberIds.forEach((eventGuestId: string) => {
        const ref = db.doc(`eventGuests/${eventGuestId}`);
        batch.update(ref, { groupId: null });
      });
      return batch.commit();
    }
    return;
  });

export const updateEventTotalGroupsCount = functions.firestore
  .document("/events/{eventId}/guestGroups/{groupId}")
  .onWrite((change, { params }) => {
    const eventRef = admin.firestore().doc(`events/${params.eventId}`);

    if (!change.before.exists) {
      // New document Created : add one to count
      return eventRef.update({ numberOfGroups: admin.firestore.FieldValue.increment(1) });
    } else if (change.before.exists && change.after.exists) {
      // Updating existing document : Do nothing
    } else if (!change.after.exists) {
      // Deleting document : subtract one from count
      return eventRef.update({ numberOfGroups: admin.firestore.FieldValue.increment(-1) });
    }
    return true;
  });
