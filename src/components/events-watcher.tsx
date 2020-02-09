import React, { useEffect } from "react";
import firebase from "firebase/app";
import { useDispatch } from "react-redux";
import {
  fetchEventSuccess,
  updateEventSuccess,
  deleteEventSuccess,
  fetchPlusOneSuccess,
  updatePlusOneSuccess,
  deletePlusOneSuccess,
  applyEventListingOrder
} from "../store/events";
import { IEvent, IPlusOneGuest } from "../store/types";
import { useStateSelector } from "../store/redux";

const EventsWatcher: React.FC<{ weddingId: string }> = ({ weddingId, children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection("events")
      .where("weddingId", "==", weddingId)
      .orderBy("dateTime")
      .onSnapshot(snap => {
        dispatch(applyEventListingOrder(snap.docs.map(({ id }) => id)));
        snap.docChanges().forEach(({ doc, type }) => {
          if (type === "added") dispatch(fetchEventSuccess({ id: doc.id, ...(doc.data() as IEvent) }));
          if (type === "modified") dispatch(updateEventSuccess({ id: doc.id, ...(doc.data() as IEvent) }));
          if (type === "removed") dispatch(deleteEventSuccess(doc.id));
        });
      });

    return unsubscribe;
  }, []);

  return <>{children}</>;
};

export const PlusOnesWatcher: React.FC<{ eventId: string }> = ({ eventId, children }) => {
  const dispatch = useDispatch();
  const weddingId = useStateSelector(state => state.activeWeddingId);

  useEffect(() => {
    const unsubscribe = firebase
      .firestore()
      .collection("events")
      .doc(eventId)
      .collection("plusOnes")
      .where("weddingId", "==", weddingId)
      .onSnapshot(snap => {
        snap.docChanges().forEach(({ doc, type }) => {
          if (type === "added") dispatch(fetchPlusOneSuccess({ id: doc.id, ...(doc.data() as IPlusOneGuest) }));
          if (type === "modified") dispatch(updatePlusOneSuccess({ id: doc.id, ...(doc.data() as IPlusOneGuest) }));
          if (type === "removed") dispatch(deletePlusOneSuccess(doc.id));
        });
      });

    return unsubscribe;
  }, []);

  return <>{children}</>;
};

export default EventsWatcher;
