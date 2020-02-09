import React, { createContext, useEffect } from "react";
import { firestore } from "firebase/app";
import { fetchGroupSuccess, applyOrder, deleteGroupSuccess, IGuestGroup } from "../store/guest-groups";
import { useDispatch } from "react-redux";

export const EventGuestGroupContext = createContext<{
  getDocRef: (groupId: string) => firestore.DocumentReference<firestore.DocumentData>;
}>({
  getDocRef: () => ({} as any)
});

export const EventGuestGroupProvider: React.FC<{ eventId: string }> = ({ eventId, children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const db = firestore();
    return db
      .collection(`events/${eventId}/guestGroups`)
      .orderBy("name", "asc")
      .onSnapshot(snap => {
        dispatch(applyOrder(snap.docs.map(({ id }) => id)));
        snap.docChanges().forEach(({ doc, type }) => {
          if (type === "added") dispatch(fetchGroupSuccess({ id: doc.id, ...(doc.data() as IGuestGroup) }));
          if (type === "modified") dispatch(fetchGroupSuccess({ id: doc.id, ...(doc.data() as IGuestGroup) }));
          if (type === "removed") dispatch(deleteGroupSuccess(doc.id));
        });
      });
  }, []);

  const getDocRef = (groupId: string) => firestore().doc(`events/${eventId}/guestGroups/${groupId}`);

  return <EventGuestGroupContext.Provider value={{ getDocRef }}>{children}</EventGuestGroupContext.Provider>;
};

export default EventGuestGroupContext;
