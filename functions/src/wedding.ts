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

export const sendAdminInviteEmail = functions.firestore.document("adminInvites/{adminInviteId}").onCreate(async (snap, { params }) => {
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
    from: "Jump the broom <info@jumpthebroom.com>",
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
export const weddingCollaborationInvitationRespond = functions.https.onCall(
  async (data: { accept: boolean; inviteId: string }, { auth }) => {
    const db = admin.firestore();
    const { accept, inviteId } = data;

    if (!auth) throw new functions.https.HttpsError("unauthenticated", "user must be signed in to complete this operation");
    if (!inviteId) throw new functions.https.HttpsError("invalid-argument", "inviteId is required");

    const collaborationInviteDoc = await db.doc(`adminInvites/${inviteId}`).get();
    const { expires, email, weddingId } = collaborationInviteDoc.data() as {
      expires: admin.firestore.Timestamp;
      email: string;
      from: string;
      weddingId: string;
    };

    if (!collaborationInviteDoc.exists) {
      throw new functions.https.HttpsError("not-found", "invitation cannot be found. It may have been deleted");
    }
    const { exists: weddingExists, ...weddingSnap } = await db.doc(`weddings/${weddingId}`).get();
    if (!weddingExists) {
      throw new functions.https.HttpsError("not-found", "wedding with weddingId: " + weddingId + "cannot be found");
    }
    if (expires.toMillis() < admin.firestore.Timestamp.now().toMillis()) {
      throw new functions.https.HttpsError("failed-precondition", "Invitation has expired");
    }
    if (email !== auth.token.email) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "The email of the signed in user does not match the email on the invitation"
      );
    }

    if (accept) {
      await Promise.all([
        db.doc(`users/${auth.uid}`).update({ weddingIds: admin.firestore.FieldValue.arrayUnion(weddingId) }),
        weddingSnap.ref.update({ "_private.collaborators": admin.firestore.FieldValue.arrayUnion(auth.uid) }),
      ]);
    }
    await db.doc(`adminInvites/${inviteId}`).delete();

    return { accept, inviteId, weddingId };
  }
);
