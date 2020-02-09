import React, { useEffect, useState, ReactElement } from "react";
import { useStateSelector } from "../store/redux";
import { useDispatch } from "react-redux";
import { IEventGuest } from "../store/types";
import { firestore } from "firebase/app";
import { fetchEventGuestSuccess, deleteEventGuestSuccess } from "../store/events";

type TRenderProp = (value: { eventGuest: IEventGuest; fetching: boolean }) => ReactElement;

interface IProps {
  id: string;
  children?: TRenderProp;
  subscribeWhileMounted?: boolean;
  renderNoGuestFound?: () => ReactElement;
  renderLoading?: () => ReactElement;
}

const EventGuest: React.FC<IProps> = ({ children, id, subscribeWhileMounted, renderNoGuestFound, renderLoading }) => {
  const db = firestore();
  const dispatch = useDispatch();
  const ref = db.doc(`eventGuests/${id}`);
  const eventGuest = useStateSelector(state => state.events.eventGuests[id]);
  const [fetching, setfetching] = useState(!eventGuest);

  useEffect(() => {
    let unsubscribe: null | (() => void);

    if (subscribeWhileMounted) {
      if (!eventGuest) setfetching(true);
      unsubscribe = ref.onSnapshot(snap => {
        if (!snap.exists) dispatch(deleteEventGuestSuccess(snap.id));
        else dispatch(fetchEventGuestSuccess({ id: snap.id, ...(snap.data() as IEventGuest) }));
        setfetching(false);
      });
    } else {
      if (!eventGuest) {
        setfetching(true);
        ref.get().then(snap => {
          dispatch(fetchEventGuestSuccess({ id: snap.id, ...(snap.data() as IEventGuest) }));
          setfetching(false);
        });
      }
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [id]);

  if (!eventGuest && !fetching) {
    return renderNoGuestFound ? renderNoGuestFound() : null;
  }

  if (!eventGuest && fetching) {
    return renderLoading ? renderLoading() : null;
  }

  return children ? children({ eventGuest, fetching }) : null;
};

export default EventGuest;
