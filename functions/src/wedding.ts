import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { mailGun } from "./utils";

export const removeGuestsAndGroupsOnWeddingDelete = functions.firestore.document("weddings/{weddingId}").onDelete(async (_, context) => {
  const db = admin.firestore();
  const guestSnaps = await db
    .collection("guests")
    .where("weddingId", "==", context.params.weddingId)
    .get();
  const groupSnaps = await db
    .collection("guestGroups")
    .where("weddingId", "==", context.params.weddingId)
    .get();
  const batch = db.batch();
  guestSnaps.forEach(({ id }) => {
    const ref = db.doc(`guests/${id}`);
    batch.delete(ref);
  });
  groupSnaps.forEach(({ id }) => {
    const ref = db.doc(`guestGroups/${id}`);
    batch.delete(ref);
  });
  try {
    await batch.commit();
    return true;
  } catch (e) {
    return false;
  }
});

export const removeWeddingFromUsersOnWeddingDelete = functions.firestore
  .document("weddings/{weddingId}")
  .onDelete(async (_, { params }) => {
    const db = admin.firestore();
    const users = await db
      .collection("users")
      .where("weddingIds", "array-contains", params.weddingId)
      .get();
    const batch = db.batch();
    users.docs.forEach(userDoc => {
      batch.update(userDoc.ref, { weddingIds: admin.firestore.FieldValue.arrayRemove(params.weddingId) });
    });

    try {
      await batch.commit();
      return true;
    } catch (e) {
      return false;
    }
  });

export const sendAdminInviteEmail = functions.firestore.document("adminInvites/adminInviteId").onCreate(async (snap, { params }) => {
  const db = admin.firestore();
  const { email, weddingId, from } = snap.data() as any;
  const weddingDoc = await db.doc(`weddings/${weddingId}`).get();
  const userDoc = await db.doc(`users/${from}`).get();

  if (!weddingDoc.exists) throw Error("wedding cannot be found");
  if (!userDoc.exists) throw Error("user cannot be found");

  const weddingName = (weddingDoc.data() as any).name;
  const userName = (userDoc.data() as any).name;
  const joinLink = `http://localhost:3000/join/${params.adminInviteId}`;
  const emailData = {
    from: "Jump the broom <sandboxee77732dae204720b35b93c18fcff294.mailgun.org>",
    to: email,
    subject: "You have been invited to edit a wedding",
    text: `${userName} has invited you to collaborate on wedding: "${weddingName}". visit this link to accept ${joinLink}`,
  };

  try {
    await new Promise((resolve, reject) =>
      mailGun.messages().send(emailData, (err, body) => {
        if (err) reject(err.message);
        else resolve(body);
      })
    );
  } catch (e) {
    throw new Error(e);
  }
});
