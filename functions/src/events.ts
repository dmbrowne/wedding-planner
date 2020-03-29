import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

export const createMainWedding = functions.firestore.document("weddings/{weddingId}").onCreate((snap, { params }) => {
  const { name, _private } = snap.data() as any;
  const weddingEvent = {
    name,
    weddingId: params.weddingId,
    startDate: admin.firestore.FieldValue.serverTimestamp(),
    main: true,
    default: true,
    _private,
  };
  const ref = admin
    .firestore()
    .collection("events")
    .doc();
  return ref.set(weddingEvent);
});
