import React, { useEffect } from "react";
import { firestore } from "firebase/app";
import { useDispatch } from "react-redux";
import { setAmenityOrder, setSubscription, fetchAmenitySuccess, deleteAmenitySuccess } from "../store/events";
import { IAmenity } from "../store/types";
import { useStateSelector } from "../store/redux";

export const AllAmenitiesContext = React.createContext({
  subscribed: false,
  subscribe: (weddingId: string) => {},
});

export const AllAmenitiesContextProvider: React.FC = ({ children }) => {
  const dispatch = useDispatch();
  let unsubscribe: (() => void) | undefined;
  const subscribed = useStateSelector(state => state.events.subscriptions.allEvents || false);

  useEffect(
    () => () => {
      if (unsubscribe) unsubscribe();
      dispatch(setSubscription("allAmenties", false));
    },
    []
  );

  const startSubscription = (weddingId: string) => {
    dispatch(setSubscription("allAmenties", true));
    unsubscribe = firestore()
      .collection("amenties")
      .where("weddingId", "==", weddingId)
      .orderBy("name")
      .onSnapshot(snap => {
        snap.docChanges().forEach(({ doc, type }) => {
          if (type === "added") dispatch(fetchAmenitySuccess({ id: doc.id, ...(doc.data() as IAmenity) }));
          if (type === "modified") dispatch(fetchAmenitySuccess({ id: doc.id, ...(doc.data() as IAmenity) }));
          if (type === "removed") dispatch(deleteAmenitySuccess(doc.id));
        });
        dispatch(setAmenityOrder(snap.docs.map(({ id }) => id)));
      });
  };

  return <AllAmenitiesContext.Provider value={{ subscribed, subscribe: startSubscription }}>{children}</AllAmenitiesContext.Provider>;
};

export default AllAmenitiesContext;
