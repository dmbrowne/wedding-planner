import React, { useRef } from "react";
import firebase, { firestore } from "firebase/app";
import { useDispatch } from "react-redux";
import { setGuestsOrder, fetchGuestSuccess, updateGuestSuccess, deleteGuestSuccess } from "../store/guests-actions";
import { IGuest } from "../store/types";
import { useStateSelector } from "../store/redux";
import usePaginationQuery from "../hooks/use-pagination-query";

type TReduxProps = {
  hasMore: boolean;
  weddingId: string;
  currentPageNumber: number;
  subscriptionPaths: {
    [path: string]: boolean;
  };
  documentsDerivedBySubscribe: {
    [path: string]: boolean;
  };
};

type TSubscriptionCallback = (snap: firebase.firestore.DocumentSnapshot<firebase.firestore.DocumentData>) => any;

interface IGuestContext {
  unsubscribe: () => void;
  loadMore: () => void;
  fetchAllGuests: () => void;
  listenToDocumentRef: (guestId: string, cb?: TSubscriptionCallback) => null | (() => void);
  getDocumentRef: (guestId: string) => firebase.firestore.DocumentReference;
  setCouple: (guest1Id: string, guest2Id: string) => Promise<void>;
  unsetCouple: (guest1Id: string, guest2Id: string) => Promise<void>;
}

export const GuestsContext = React.createContext<IGuestContext>({
  unsubscribe: () => {},
  loadMore: () => {},
  fetchAllGuests: () => {},
  listenToDocumentRef: () => ({} as any),
  getDocumentRef: () => ({} as any),
  setCouple: () => Promise.resolve(),
  unsetCouple: () => Promise.resolve()
});

export const GuestsProvider: React.FC = ({ children }) => {
  const dispatch = useDispatch();
  const weddingId = useStateSelector(state => state.activeWeddingId);
  const collectionRef = firebase.firestore().collection(`guests`);
  const query = collectionRef
    .where("weddingId", "==", weddingId)
    .orderBy("name", "asc")
    .limit(20);
  const lastDocument = useRef<firestore.DocumentSnapshot<firestore.DocumentData> | undefined>(undefined);

  const getDocumentRef = (guestId: string) => collectionRef.doc(guestId);

  const fetchAllGuests = () => {
    return query.get().then(querySnap => {
      querySnap.docChanges().forEach(({ doc, type }) => {
        if (type === "added") dispatch(fetchGuestSuccess({ id: doc.id, ...(doc.data() as IGuest) }));
      });
      dispatch(setGuestsOrder(querySnap.docs.map(({ id }) => id)));
      const lastDoc = querySnap.docs[querySnap.docs.length - 1];
      lastDocument.current = lastDoc;
    });
  };

  const { loadMore, unsubscribe } = usePaginationQuery(
    query,
    {
      onOrder: order => dispatch(setGuestsOrder(order)),
      onSnap: (type, doc) => {
        if (type === "added") dispatch(fetchGuestSuccess({ id: doc.id, ...(doc.data() as IGuest) }));
        if (type === "modified") dispatch(updateGuestSuccess({ id: doc.id, ...(doc.data() as IGuest) }));
        if (type === "removed") dispatch(deleteGuestSuccess(doc.id));
      }
    },
    lastDocument.current
  );

  const listenToDocumentRef = (guestId: string, cb?: TSubscriptionCallback) => {
    return getDocumentRef(guestId).onSnapshot(snap => {
      dispatch(fetchGuestSuccess({ id: snap.id, ...(snap.data() as IGuest) }));
      if (cb) cb(snap);
    });
  };

  const guestCouple = (guestId1: string, guestId2: string, link: boolean) => {
    const batch = firebase.firestore().batch();
    batch.update(getDocumentRef(guestId1), { partnerId: link ? guestId2 : null });
    batch.update(getDocumentRef(guestId2), { partnerId: link ? guestId1 : null });
    return batch.commit();
  };

  return (
    <GuestsContext.Provider
      value={{
        unsubscribe,
        loadMore,
        listenToDocumentRef,
        getDocumentRef,
        setCouple: (id1, id2) => guestCouple(id1, id2, true),
        unsetCouple: (id1, id2) => guestCouple(id1, id2, false),
        fetchAllGuests
      }}
    >
      {children}
    </GuestsContext.Provider>
  );
};
