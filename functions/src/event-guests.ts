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
        ),
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
interface IEvent {
  allowRsvpPerService: boolean;
  services?: { [serviceId: string]: Object };
}

export const updateGuestRsvpsOnEventServiceChange = functions.firestore
  .document("events/{eventId}")
  .onUpdate(async ({ before, after }, { params }) => {
    const db = admin.firestore();
    const beforeData = before.data() as IEvent;
    const afterData = after.data() as IEvent;
    const beforeServices = beforeData.services;
    const afterServices = afterData.services;

    const changedToMulti = !beforeData.allowRsvpPerService && !!beforeData.allowRsvpPerService;
    const changedToSingle = !!beforeData.allowRsvpPerService && !afterData.allowRsvpPerService;
    const isAnUpdate = !!beforeServices && afterServices;

    const guestsAndPlusOnes = Promise.all([
      db
        .collection(`eventsGuests`)
        .where("eventId", "==", params.eventId)
        .get(),
      db.collection(`events/${params.eventId}/plusOnes`).get(),
    ]);

    if (changedToMulti && afterServices) {
      return changeRsvpsToObject(guestsAndPlusOnes, Object.keys(afterServices));
    }

    if (changedToSingle) {
      return changeRsvpsToSingleBoolean(guestsAndPlusOnes);
    }

    if (isAnUpdate && beforeServices && afterServices && afterData.allowRsvpPerService) {
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
      const { eventId } = change.before.data() as any;
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
        numberOfPlusOnes: admin.firestore.FieldValue.increment(1),
      });
    } else if (change.before.exists && change.after.exists) {
      // Updating existing document : Do nothing
    } else if (!change.after.exists) {
      // Deleting document : subtract one from count
      return eventRef.update({
        [eventGuestCountKey]: admin.firestore.FieldValue.increment(-1),
        numberOfPlusOnes: admin.firestore.FieldValue.increment(-1),
      });
    }
    return true;
  });

function handeleGuestRsvp(
  change: functions.Change<functions.firestore.DocumentSnapshot>,
  eventRef: admin.firestore.DocumentReference<admin.firestore.DocumentData>
) {
  const beforeData = change.before.data() as { rsvp?: boolean | { [serviceId: string]: boolean } };
  const afterData = change.after.data() as { rsvp?: boolean | { [serviceId: string]: boolean } };

  // rsvp hasn't changed. exit out.
  if (beforeData.rsvp === afterData.rsvp) return true;

  let previouslyAttending = undefined;
  let isAttending = undefined;

  if (typeof beforeData.rsvp === "object") {
    previouslyAttending = Object.values(beforeData.rsvp).some(attending => attending);
  } else if (typeof beforeData.rsvp === "boolean") {
    previouslyAttending = beforeData.rsvp;
  }

  if (typeof afterData.rsvp === "object") {
    isAttending = Object.values(afterData.rsvp).some(attending => attending);
  } else if (typeof afterData.rsvp === "boolean") {
    isAttending = afterData.rsvp;
  }

  return eventRef.update({
    // event has been changed from single to multi (vice-versa), but still marked as attending
    ...(previouslyAttending && isAttending && {}),

    // previously rsvp'd as not attending, but is now attending
    ...(previouslyAttending === false &&
      isAttending && {
        attending: admin.firestore.FieldValue.increment(1),
        notAttending: admin.firestore.FieldValue.increment(-1),
      }),
    ...(previouslyAttending &&
      isAttending === false && {
        attending: admin.firestore.FieldValue.increment(-1),
        notAttending: admin.firestore.FieldValue.increment(1),
      }),

    //had not yet rsvp'd but is now attending
    ...(previouslyAttending === undefined && isAttending && { attending: admin.firestore.FieldValue.increment(1) }),

    // was previously attending, but rsvp does not exist (this is likely in the event of a data error)
    ...(previouslyAttending && isAttending === undefined && { attending: admin.firestore.FieldValue.increment(-1) }),
    ...(previouslyAttending === false &&
      isAttending === undefined && { notAttending: admin.firestore.FieldValue.increment(-1) }),
  });
}

export const updateAttendingEventTotalOnPlusOneChange = functions.firestore
  .document("/events/{eventId}/plusOnes/{plusOneId}")
  .onUpdate((change, { params }) => {
    return handeleGuestRsvp(change, admin.firestore().doc(`events/${params.eventId}`));
  });
export const updateAttendingEventTotalOnPlusOneCreate = functions.firestore
  .document("/events/{eventId}/plusOnes/{plusOneId}")
  .onCreate((snap, { params }) => {
    const data = snap.data() as { rsvp?: boolean | { [serviceId: string]: boolean } };

    let isAttending;

    if (typeof data.rsvp === "object") {
      isAttending = Object.values(data.rsvp).some(attending => attending);
    } else if (typeof data.rsvp === "boolean") {
      isAttending = data.rsvp;
    } else {
      // rsvp doesnt exists on object, ignore
      return true;
    }

    return admin
      .firestore()
      .doc(`events/${params.eventId}`)
      .update(
        isAttending
          ? { attending: admin.firestore.FieldValue.increment(1) }
          : { notAttending: admin.firestore.FieldValue.increment(1) }
      );
  });

export const updateAttendingEventTotalOnPlusOneDelete = functions.firestore
  .document("/events/{eventId}/plusOnes/{plusOneId}")
  .onDelete((snap, { params }) => {
    const data = snap.data() as { rsvp?: boolean | { [serviceId: string]: boolean } };

    let wasAttending;

    if (typeof data.rsvp === "object") {
      wasAttending = Object.values(data.rsvp).some(attending => attending);
    } else if (typeof data.rsvp === "boolean") {
      wasAttending = data.rsvp;
    } else {
      // rsvp didnt exists, ignore.
      return true;
    }

    return admin
      .firestore()
      .doc(`events/${params.eventId}`)
      .update(
        wasAttending
          ? { attending: admin.firestore.FieldValue.increment(-1) }
          : { notAttending: admin.firestore.FieldValue.increment(-1) }
      );
  });

export const updateAttendingEventTotalOnEventGuestChange = functions.firestore
  .document("/eventGuests/{eventGuestId}")
  .onUpdate(change => {
    return handeleGuestRsvp(change, admin.firestore().doc(`events/${(change.after.data() as any).eventId}`));
  });

export const updateAttendingEventTotalOnEventGuestCreate = functions.firestore
  .document("/eventGuests/{eventGuestId}")
  .onCreate(snap => {
    const data = snap.data() as { eventId: string; rsvp?: boolean | { [serviceId: string]: boolean } };

    let isAttending;

    if (typeof data.rsvp === "object") {
      isAttending = Object.values(data.rsvp).some(attending => attending);
    } else if (typeof data.rsvp === "boolean") {
      isAttending = data.rsvp;
    } else {
      // rsvp doesnt exists on object, ignore
      return true;
    }

    return admin
      .firestore()
      .doc(`events/${data.eventId}`)
      .update(
        isAttending
          ? { attending: admin.firestore.FieldValue.increment(1) }
          : { notAttending: admin.firestore.FieldValue.increment(1) }
      );
  });

export const updateAttendingEventTotalOnEventGuestDelete = functions.firestore
  .document("/eventGuests/{eventGuestId}")
  .onDelete(snap => {
    const data = snap.data() as { eventId: string; rsvp?: boolean | { [serviceId: string]: boolean } };

    let wasAttending;

    if (typeof data.rsvp === "object") {
      wasAttending = Object.values(data.rsvp).some(attending => attending);
    } else if (typeof data.rsvp === "boolean") {
      wasAttending = data.rsvp;
    } else {
      // rsvp didnt exists, ignore.
      return true;
    }

    return admin
      .firestore()
      .doc(`events/${data.eventId}`)
      .update(
        wasAttending
          ? { attending: admin.firestore.FieldValue.increment(-1) }
          : { notAttending: admin.firestore.FieldValue.increment(-1) }
      );
  });
