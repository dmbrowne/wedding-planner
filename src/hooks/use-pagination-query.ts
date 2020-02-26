import { useState, useEffect } from "react";
import { firestore } from "firebase/app";
import { useRef } from "react";

type TOnSnap = (
  change: firestore.DocumentChange<firestore.DocumentData>["type"],
  doc: firestore.QueryDocumentSnapshot<firestore.DocumentData>
) => void;
type TOnOrder = (idOrder: string[]) => void;

export default function usePaginationQuery(
  query: firestore.Query<firestore.DocumentData>,
  callbacks: { onSnap: TOnSnap; onOrder: TOnOrder },
  previousDocument?: firestore.DocumentSnapshot<firestore.DocumentData>
) {
  const unsubscribers = useRef<(() => void)[]>([]);
  const [fetchInProgress, setfetchInProgress] = useState(false);
  const [order, setOrder] = useState<Array<string[]>>([]);
  const lastDocument = useRef<
    firestore.QueryDocumentSnapshot<firestore.DocumentData> | firestore.DocumentSnapshot<firestore.DocumentData> | undefined
  >(undefined);

  useEffect(() => {
    if (previousDocument) {
      lastDocument.current = previousDocument;
    }
  }, [previousDocument]);

  const loadMore = () => {
    if (fetchInProgress) return;
    setfetchInProgress(true);
    const newOrderIdx = unsubscribers.current.length;
    if (lastDocument.current) {
      unsubscribers.current.push(
        query.startAfter(lastDocument.current).onSnapshot(snap => {
          console.log("onSnap");
          return doStuffWithResults(snap, newOrderIdx);
        })
      );
    } else {
      unsubscribers.current.push(
        query.onSnapshot(snap => {
          console.log("onSnap");
          return doStuffWithResults(snap, newOrderIdx);
        })
      );
    }
  };

  function doStuffWithResults(snap: firestore.QuerySnapshot<firestore.DocumentData>, callOrderIdx: number) {
    const idOrder = snap.docs.map(({ id }) => id);
    const newOrder = [...order];
    newOrder[callOrderIdx] = idOrder;
    setOrder(newOrder);

    if (callOrderIdx + 1 === unsubscribers.current.length) {
      lastDocument.current = snap.docs[snap.docs.length - 1];
    }

    callbacks.onOrder(newOrder.reduce((accum, ids) => [...accum, ...ids], []));
    snap.docChanges().forEach(({ doc, type }) => callbacks.onSnap(type, doc));
  }

  return {
    loadMore,
    unsubscribe: () => {
      unsubscribers.current.forEach(unsubscribe => unsubscribe());
    },
  };
}
