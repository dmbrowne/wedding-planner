import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const deletePlusOnesOnEventGuestDelete = functions.firestore
  .document("events/{eventId}/guests/{guestId}")
  .onDelete((snap, { params }) => {
    const data = snap.data() as any;
    if (!data.plusOnes) return;

    const db = admin.firestore();
    const batch = db.batch();
    data.plusOnes.forEach((id: string) => {
      const ref = db.doc(`events/${params.eventId}/plusOnes/${id}`);
      batch.delete(ref);
    });

    return batch.commit();
  });

export const removePlusOneFromGuestOnPlusOneDelete = functions.firestore
  .document("events/{eventId}/plusOnes/{plusOneId}")
  .onDelete((snap, { params }) => {
    const { guestId } = snap.data() as any;
    if (guestId) {
      return admin
        .firestore()
        .doc(`events/${params.eventId}/guests/${guestId}`)
        .update({
          plusOnes: admin.firestore.FieldValue.arrayRemove(snap.id)
        });
    }
    return true;
  });

export const updateRsvpsOnChangeEventType = functions.firestore
  .document("events/{eventId}")
  .onUpdate(async ({ before, after }, { params }) => {
    const afterServices: { [serviceId: string]: Object } = (after.data() as any).services;
    const changedToMulti = !(before.data() as any).services && afterServices;
    const changedToSingle = (before.data() as any).services && !afterServices;
    const isAnUpdate = (before.data() as any).services && afterServices;

    const guestsAndPlusOnes = Promise.all([
      admin
        .firestore()
        .collection(`events/${params.eventId}/guests`)
        .get(),
      admin
        .firestore()
        .collection(`events/${params.eventId}/plusOnes`)
        .get()
    ]);

    if (changedToMulti) {
      const serviceIds = Object.keys(afterServices);
      const updates = await guestsAndPlusOnes.then(([guestQuerySnap, plusOneQuerySnap]) => {
        return [...guestQuerySnap.docs, ...plusOneQuerySnap.docs].map(snap => {
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

    if (changedToSingle) {
      const updates = await guestsAndPlusOnes.then(([guestQuerySnap, plusOneQuerySnap]) => {
        return [...guestQuerySnap.docs, ...plusOneQuerySnap.docs].map(snap => {
          const rsvpVal = snap.data().rsvp as { [serviceId: string]: boolean } | undefined;
          const isAttending = rsvpVal && Object.entries(rsvpVal).some(([, attending]) => !!attending);
          return snap.ref.update({ rsvp: isAttending });
        });
      });
      return Promise.all(updates);
    }

    if (isAnUpdate) {
      const existingServiceIds = Object.keys((before.data() as any).services as { [serviceId: string]: Object }).filter(
        id => afterServices[id]
      );
      const updates = await guestsAndPlusOnes.then(([guestQuerySnap, plusOneQuerySnap]) => {
        return [...guestQuerySnap.docs, ...plusOneQuerySnap.docs].map(snap => {
          const data = snap.data();
          const rsvp =
            data.rsvp && typeof data.rsvp === "object"
              ? existingServiceIds.reduce(
                  (accum, serviceId) => ({
                    ...accum,
                    [serviceId]: !!data.rsvp[serviceId]
                  }),
                  {} as { [serviceId: string]: Object }
                )
              : {};
          return snap.ref.update({ rsvp });
        });
      });
      return Promise.all(updates);
    }

    return true;
  });

export const createPartnerGroupOnEventGuestAdd = functions.firestore
  .document("events/{eventId}/guests/{guestId}")
  .onCreate(async (snap, { params }) => {
    const db = admin.firestore();
    const eventGuest = snap.data() as any;

    if (eventGuest.plusOnes) return;

    const guestSnap = await db.doc(`guests/${params.guestId}`).get();
    const guest = guestSnap.data() as any;

    if (!guest.partnerId) return;

    const eventGuestPartner = await db.doc(`events/${params.eventId}/guests/${guest.partnerId}`).get();

    if (!eventGuestPartner.exists) return;

    const group = {
      memberIds: [eventGuest.id, eventGuestPartner.id],
      partnerGroup: true
    };

    const batch = db.batch();
    const newGroupRef = db.collection(`events/${params.eventId}/guestGroups`).doc();
    batch.set(newGroupRef, group);
    batch.update(snap.ref, { groupId: newGroupRef.id });
    batch.update(eventGuestPartner.ref, { groupId: newGroupRef.id });
    return batch.commit();
  });

export const removePartnerGroupOnEventGuestDelete = functions.firestore
  .document("events/{eventId}/guests/{guestId}")
  .onDelete(async (snap, { params }) => {
    const db = admin.firestore();
    const eventGuest = snap.data() as any;

    if (!eventGuest.groupId) return;

    const groupSnapshot = await db.doc(`events/${params.eventId}/guestGroups/${eventGuest.groupId}`).get();
    const group = groupSnapshot.data() as any;

    if (!groupSnapshot.exists) return;

    if (group.partnerGroup) {
      return groupSnapshot.ref.delete();
    }

    return;
  });

export const cleanUpGroupIdFieldsOnGroupDelete = functions.firestore
  .document("events/{eventId}/guestsGroups/{groupId}")
  .onDelete(async (snap, { params }) => {
    const db = admin.firestore();
    const group = snap.data() as any;

    if (group.memberIds && Array.isArray(group.memberIds)) {
      const batch = db.batch();
      group.memberIds.forEach((memberId: string) => {
        const ref = db.doc(`events/${params.eventId}/guests/${memberId}`);
        batch.update(ref, { groupId: null });
      });
      return batch.commit();
    }

    return;
  });
