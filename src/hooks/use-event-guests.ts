import { IEventGuest } from "../store/types";
import {
  fetchEventGuestSuccess,
  updateEventGuestSuccess,
  deleteEventGuestSuccess,
  applyGuestListingOrder
} from "../store/events";
import { useDispatch } from "react-redux";
import { firestore } from "firebase/app";
import usePaginationHandler from "./use-pagination-query";
import { useRef } from "react";

export default function useEventGuests(weddingId: string, eventId: string) {
  const db = firestore();
  const dispatch = useDispatch();
  const lastDocument = useRef<firestore.DocumentSnapshot<firestore.DocumentData> | undefined>(undefined);

  const query = db
    .collection("eventGuests")
    .where("weddingId", "==", weddingId)
    .where("eventId", "==", eventId)
    .orderBy("name", "asc");

  const loadAllDocuments = () =>
    query.get().then(querySnap => {
      querySnap.docChanges().forEach(({ doc, type }) => {
        if (type === "added") dispatch(fetchEventGuestSuccess({ id: doc.id, ...(doc.data() as IEventGuest) }));
      });
      dispatch(applyGuestListingOrder(querySnap.docs.map(({ id }) => id)));
      const lastDoc = querySnap.docs[querySnap.docs.length - 1];
      lastDocument.current = lastDoc;
    });

  const { loadMore, unsubscribe } = usePaginationHandler(
    query,
    {
      onSnap: (type, doc) => {
        if (type === "added") dispatch(fetchEventGuestSuccess({ id: doc.id, ...(doc.data() as IEventGuest) }));
        if (type === "modified") dispatch(updateEventGuestSuccess({ id: doc.id, ...(doc.data() as IEventGuest) }));
        if (type === "removed") dispatch(deleteEventGuestSuccess(doc.id));
      },
      onOrder: order => dispatch(applyGuestListingOrder(order))
    },
    lastDocument.current
  );

  return { loadAllDocuments, loadMore, unsubscribe };
}
