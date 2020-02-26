import React, { useEffect, useState, ReactElement } from "react";
import { useStateSelector } from "../store/redux";
import { useDispatch } from "react-redux";
import { IPlusOneGuest } from "../store/types";
import { firestore } from "firebase/app";
import { fetchPlusOneSuccess, deletePlusOneSuccess } from "../store/events";

type TRenderProp = (value: { plusOneGuest: IPlusOneGuest; fetching: boolean }) => ReactElement;

interface IProps {
  id: string;
  eventId: string;
  children?: TRenderProp;
  subscribeWhileMounted?: boolean;
  renderNoGuestFound?: () => ReactElement;
  renderLoading?: () => ReactElement;
}

const PlusOne: React.FC<IProps> = ({ children, eventId, id, subscribeWhileMounted, renderNoGuestFound, renderLoading }) => {
  const dispatch = useDispatch();
  const plusOneRef = firestore()
    .collection("events")
    .doc(eventId)
    .collection("plusOnes")
    .doc(id);
  const plusOneGuest = useStateSelector(state => state.events.plusOnes[id]);
  const [fetching, setfetching] = useState(!plusOneGuest);

  const onPlusOneFetchSuccess = (doc: firestore.DocumentSnapshot<firestore.DocumentData>) => {
    if (doc.exists) dispatch(fetchPlusOneSuccess({ id: doc.id, ...(doc.data() as any) }));
    else dispatch(deletePlusOneSuccess(doc.id));
    setfetching(false);
  };

  useEffect(() => {
    let unsubscribe: null | (() => void);

    if (!plusOneGuest) {
      setfetching(true);
    }

    if (subscribeWhileMounted) {
      unsubscribe = plusOneRef.onSnapshot(onPlusOneFetchSuccess);
    } else {
      if (!plusOneGuest) {
        plusOneRef.get().then(onPlusOneFetchSuccess);
      }
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [id]);

  if (!plusOneGuest && !fetching) {
    return renderNoGuestFound ? renderNoGuestFound() : null;
  }

  if (!plusOneGuest && fetching) {
    return renderLoading ? renderLoading() : null;
  }

  return children ? children({ plusOneGuest, fetching }) : null;
};

export default PlusOne;
