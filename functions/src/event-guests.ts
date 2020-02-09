import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const eventGuestCountKey = "numberOfGuests";

async function changeRsvpsToObject(
  guestsAndPlusOnes: Promise<admin.firestore.QuerySnapshot<admin.firestore.DocumentData>[]>,
  serviceIds: string[]
) {
  const updates = await guestsAndPlusOnes.then(([eventGuestQuerySnap, plusOneQuerySnap]) => {
    return [...eventGuestQuerySnap.docs, ...plusOneQuerySnap.docs].map(snap => {
      const rsvpVal = snap.data().rsvp;
      return snap.ref.update({
        rsvp: serviceIds.reduce(
          (accum, serviceId) => ({ ...accum, [serviceId]: !!rsvpVal }),
          {} as { [serviceId: string]: boolean }
        )
      });
    });
  });
  return Promise.all(updates);
}

async function changeRsvpsToSingleBoolean(
  guestsAndPlusOnes: Promise<admin.firestore.QuerySnapshot<admin.firestore.DocumentData>[]>
) {
  const updates = await guestsAndPlusOnes.then(([eventGuestQuerySnap, plusOneQuerySnap]) => {
    return [...eventGuestQuerySnap.docs, ...plusOneQuerySnap.docs].map(snap => {
      const rsvpVal = snap.data().rsvp as { [serviceId: string]: boolean } | boolean | undefined;
      const isAttending = typeof rsvpVal === "object" && Object.values(rsvpVal).some(attending => !!attending);
      return snap.ref.update({ rsvp: isAttending });
    });
  });
  return Promise.all(updates);
}

async function removeDeletedServiceRsvps(
  guestsAndPlusOnes: Promise<admin.firestore.QuerySnapshot<admin.firestore.DocumentData>[]>,
  beforeServicesIds: string[],
  afterServicesIds: string[]
) {
  const removedServiceIds = beforeServicesIds.filter(x => !afterServicesIds.includes(x));
  return await guestsAndPlusOnes.then(([eventGuestQuerySnap, plusOneQuerySnap]) => {
    return [...eventGuestQuerySnap.docs, ...plusOneQuerySnap.docs].map(snap => {
      const data = snap.data();
      if (typeof data.rsvp === "undefined") return Promise.resolve();
      if (typeof data.rsvp === "boolean") return snap.ref.update({ rsvp: null });
      if (typeof data.rsvp === "object")
        return Promise.all(removedServiceIds.map(serviceId => snap.ref.update({ [`rsvp.${serviceId}`]: null })));
      return Promise.resolve();
    });
  });
}

export const updateGuestRsvpsOnEventServiceChange = functions.firestore
  .document("events/{eventId}")
  .onUpdate(async ({ before, after }, { params }) => {
    const db = admin.firestore();
    const beforeServices = (before.data() as { services?: { [serviceId: string]: Object } }).services;
    const afterServices = (after.data() as { services?: { [serviceId: string]: Object } }).services;

    if (beforeServices === afterServices) {
      return true;
    }

    const changedToMulti = !beforeServices && !!afterServices;
    const changedToSingle = !!beforeServices && !afterServices;
    const isAnUpdate = !!beforeServices && afterServices;

    const guestsAndPlusOnes = Promise.all([
      db
        .collection(`eventsGuests`)
        .where("eventId", "==", params.eventId)
        .get(),
      db.collection(`events/${params.eventId}/plusOnes`).get()
    ]);

    if (changedToMulti && afterServices) {
      return changeRsvpsToObject(guestsAndPlusOnes, Object.keys(afterServices));
    }

    if (changedToSingle) {
      return changeRsvpsToSingleBoolean(guestsAndPlusOnes);
    }

    if (isAnUpdate && beforeServices && afterServices) {
      const beforeServicesIds = Object.keys(beforeServices);
      const afterServicesIds = Object.keys(afterServices);
      return removeDeletedServiceRsvps(guestsAndPlusOnes, beforeServicesIds, afterServicesIds);
    }

    return true;
  });

export const removeMemberIdFromGroupOnEventGuestDelete = functions.firestore
  .document("eventGuests/{eventGuestId}")
  .onDelete(async (snap, { params }) => {
    const db = admin.firestore();
    const eventGuest = snap.data() as any;

    if (!eventGuest.groupId) return false;

    const { eventId, groupId } = snap.data() as any;
    const groupSnapshot = await db.doc(`events/${eventId}/guestGroups/${groupId}`).get();

    if (!groupSnapshot.exists) return false;

    return groupSnapshot.ref.update({ memberIds: admin.firestore.FieldValue.arrayRemove(params.eventGuestId) });
  });

export const updateEventTotalGuestsCountOnEventGuestChange = functions.firestore
  .document("/eventGuests/{eventGuestId}")
  .onWrite(change => {
    const eventRef = (eventId: string) => admin.firestore().doc(`events/${eventId}`);

    if (!change.before.exists) {
      // New document Created : add one to count
      const { eventId } = change.after.data() as any;
      return eventRef(eventId).update({ [eventGuestCountKey]: admin.firestore.FieldValue.increment(1) });
    } else if (change.before.exists && change.after.exists) {
      // Updating existing document : Do nothing
    } else if (!change.after.exists) {
      // Deleting document : subtract one from count
      const { eventId } = change.after.data() as any;
      return eventRef(eventId).update({ [eventGuestCountKey]: admin.firestore.FieldValue.increment(-1) });
    }
    return true;
  });

export const updateEventTotalGuestsCountOnPlusOneChange = functions.firestore
  .document("/events/{eventId}/plusOnes/{plusOneId}")
  .onWrite((change, { params }) => {
    const eventRef = admin.firestore().doc(`events/${params.eventId}`);

    if (!change.before.exists) {
      // New document Created : add one to count
      return eventRef.update({
        [eventGuestCountKey]: admin.firestore.FieldValue.increment(1),
        numberOfPlusOnes: admin.firestore.FieldValue.increment(1)
      });
    } else if (change.before.exists && change.after.exists) {
      // Updating existing document : Do nothing
    } else if (!change.after.exists) {
      // Deleting document : subtract one from count
      return eventRef.update({
        [eventGuestCountKey]: admin.firestore.FieldValue.increment(-1),
        numberOfPlusOnes: admin.firestore.FieldValue.increment(-1)
      });
    }
    return true;
  });
