import { fetchGroupSuccess, deleteGroupSuccess, applyOrder, IGuestGroup } from "./../store/guest-groups";
import usePaginationQuery from "./use-pagination-query";
import { firestore } from "firebase/app";
import { useDispatch } from "react-redux";
import { Dispatch } from "redux";
import { useRef } from "react";
import { useStateSelector } from "../store/redux";

type TOnDocChange =
  | { type: "order"; data: string[] }
  | {
      type: firestore.DocumentChange<firestore.DocumentData>["type"];
      data: firestore.QueryDocumentSnapshot<firestore.DocumentData>;
    };

const onDocChange = (dispatch: Dispatch<any>, change: TOnDocChange) => {
  switch (change.type) {
    case "order":
      return dispatch(applyOrder(change.data));
    case "added":
    case "modified":
      return dispatch(fetchGroupSuccess({ id: change.data.id, ...(change.data.data() as IGuestGroup) }));
    case "removed":
      return dispatch(deleteGroupSuccess(change.data.id));
  }
};

const guestGroupCollectionQuery = (weddingId: string, eventId: string) => {
  return firestore()
    .collection(`events/${eventId}/guestGroups`)
    .where("weddingId", "==", weddingId)
    .orderBy("name", "asc");
};

export default function useGuestGroupsLoadMore(eventId: string) {
  const dispatch = useDispatch();
  const weddingId = useStateSelector(state => state.activeWeddingId);
  const query = guestGroupCollectionQuery(weddingId, eventId);

  return usePaginationQuery(query, {
    onSnap: (type, doc) => onDocChange(dispatch, { type, data: doc }),
    onOrder: order => onDocChange(dispatch, { type: "order", data: order })
  });
}

export const useWatchTopFiveDocuments = (eventId: string) => {
  const dispatch = useDispatch();
  const weddingId = useStateSelector(state => state.activeWeddingId);
  const query = guestGroupCollectionQuery(weddingId, eventId).limit(5);
  const subscription = useRef<undefined | (() => void)>(undefined);

  const listen = () =>
    new Promise(resolve => {
      subscription.current = query.onSnapshot(querySnap => {
        resolve();
        querySnap.docChanges().forEach(({ doc, type }) => onDocChange(dispatch, { type, data: doc }));
        onDocChange(dispatch, { type: "order", data: querySnap.docs.map(({ id }) => id) });
      });
    });

  const unsubscribe = subscription.current;
  return {
    listen,
    unsubscribe: unsubscribe
      ? () => {
          unsubscribe();
          subscription.current = undefined;
        }
      : undefined
  };
};

export const useWatchAllDocuments = (eventId: string) => {
  const dispatch = useDispatch();
  const weddingId = useStateSelector(state => state.activeWeddingId);
  const query = guestGroupCollectionQuery(weddingId, eventId);
  const subscription = useRef<undefined | (() => void)>(undefined);

  const listen = () => {
    subscription.current = query.onSnapshot(querySnap => {
      querySnap.docChanges().forEach(({ doc, type }) => onDocChange(dispatch, { type, data: doc }));
      onDocChange(dispatch, { type: "order", data: querySnap.docs.map(({ id }) => id) });
    });
  };
  const unsubscribe = subscription.current;
  return {
    listen,
    unsubscribe: unsubscribe
      ? () => {
          unsubscribe();
          subscription.current = undefined;
        }
      : undefined
  };
};

export const getDocumentRef = (eventId: string, groupId: string) => {
  return firestore().collection(`events/${eventId}/guestGroups/${groupId}`);
};
