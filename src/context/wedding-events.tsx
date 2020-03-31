import React, { useEffect } from "react";
import { firestore } from "firebase/app";
import { useDispatch } from "react-redux";
import { fetchEventSuccess, updateEventSuccess, deleteEventSuccess, applyEventListingOrder, setSubscription } from "../store/events";
import { IEvent } from "../store/types";
import { useStateSelector } from "../store/redux";

export const WeddingEventsContext = React.createContext({
  subscribed: false,
  subscribe: (weddingId: string) => {},
});

export const WeddingEventsContextProvider: React.FC = ({ children }) => {
  const dispatch = useDispatch();
  let unsubscribe: (() => void) | undefined;
  const subscribed = useStateSelector(state => state.events.subscriptions.allEvents || false);

  useEffect(
    () => () => {
      if (unsubscribe) unsubscribe();
      dispatch(setSubscription("allEvents", false));
    },
    []
  );

  const startSubscription = (weddingId: string) => {
    dispatch(setSubscription("allEvents", true));
    unsubscribe = firestore()
      .collection("events")
      .where("weddingId", "==", weddingId)
      .orderBy("startDate")
      .onSnapshot(snap => {
        snap.docChanges().forEach(({ doc, type }) => {
          if (type === "added") dispatch(fetchEventSuccess({ id: doc.id, ...(doc.data() as IEvent) }));
          if (type === "modified") dispatch(updateEventSuccess({ id: doc.id, ...(doc.data() as IEvent) }));
          if (type === "removed") dispatch(deleteEventSuccess(doc.id));
        });
        dispatch(applyEventListingOrder(snap.docs.map(({ id }) => id)));
      });
  };

  return <WeddingEventsContext.Provider value={{ subscribed, subscribe: startSubscription }}>{children}</WeddingEventsContext.Provider>;
};

export default WeddingEventsContext;
