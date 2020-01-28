import React, { ReactNode, useEffect, useContext, useState, ReactElement } from "react";
import { useStateSelector } from "../store/redux";
import { GuestsContext } from "./guests-context";
import { useDispatch } from "react-redux";
import { fetchGuestSuccess } from "../store/guests-actions";
import { IGuest } from "../store/types";

type TRenderProp = (value: { guest: IGuest | null; fetching: boolean; ready: boolean }) => any;

interface IProps {
  id: string;
  children?: TRenderProp;
  render?: TRenderProp;
  subscribeWhileMounted?: boolean;
}

const Guest: React.FC<IProps> = ({ render, children, id, subscribeWhileMounted }) => {
  const dispatch = useDispatch();
  const guest = useStateSelector(state => state.guests.byId[id]);
  const [fetching, setfetching] = useState(!guest);
  const { listenToDocumentRef, getDocumentRef } = useContext(GuestsContext);

  useEffect(() => {
    let unsubscribe: null | (() => void);
    if (!guest) {
      if (!subscribeWhileMounted) {
        setfetching(true);
        getDocumentRef(id)
          .get()
          .then(snap => {
            dispatch(fetchGuestSuccess({ id: snap.id, ...(snap.data() as IGuest) }));
            setfetching(false);
          });
      } else {
        setfetching(true);
        unsubscribe = listenToDocumentRef(id, () => setfetching(false));
      }
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [id]);

  return children
    ? children({ guest, fetching, ready: !!guest && !fetching })
    : render
    ? render({ guest, fetching, ready: !!guest && !fetching })
    : null;
};

export default Guest;
