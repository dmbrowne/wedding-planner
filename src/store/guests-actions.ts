import { IGuestsReducer } from "./guests-reducer";
import { INewGuest } from "./use-new-guests-reducer";
import { Thunk } from "./redux";
import { firestore } from "firebase/app";
import { IGuest } from "./types";

interface IAddGuests {
  type: "guests/ADD";
  payload: INewGuest[];
}
interface IAddGuestsSuccess {
  type: "guests/ADD_SUCCESS";
  payload?: undefined;
}
interface IFetchGuest {
  type: "guests/FETCH";
  payload: { guestId: string };
}
interface IFetchGuestError {
  type: "guests/FETCH_ERROR";
  payload: any;
}
interface ISetCurrentQueryPageNumber {
  type: "guests/SET_CURRENT_PAGE_NUMBER";
  payload: number;
}

export const addNewGuests = (guests: INewGuest[]): Thunk<void, IAddGuests | IAddGuestsSuccess> => (
  dispatch,
  getState
) => {
  const weddingId = getState().activeWeddingId;
  dispatch({ type: "guests/ADD", payload: guests });

  const batcher = firestore().batch();

  guests.forEach(guest => {
    const ref = firestore().doc(`guests/${guest.id}`);
    batcher.set(ref, { ...guest, weddingId });
  });

  batcher.commit().then(() =>
    dispatch({
      type: "guests/ADD_SUCCESS"
    })
  );
};

export const fetchGuestSuccess = (guest: IGuest, subscribed?: boolean) => ({
  type: "guests/FETCH_SUCCESS" as "guests/FETCH_SUCCESS",
  payload: guest,
  meta: { subscribed }
});

export const fetchGuest = (
  guestId: string
): Thunk<void, IFetchGuest | TFetchGuestSuccess | IFetchGuestError> => dispatch => {
  dispatch({ type: "guests/FETCH", payload: { guestId } });

  firestore()
    .doc(`guests/${guestId}`)
    .get()
    .then(snap => {
      dispatch(fetchGuestSuccess({ id: snap.id, ...(snap.data() as any) }));
    })
    .catch(err => dispatch({ type: "guests/FETCH_ERROR", payload: err }));
};

export const updateGuestSuccess = (guest: IGuest) => ({
  type: "guests/UPDATE_SUCCESS" as "guests/UPDATE_SUCCESS",
  payload: guest
});

export const unsubscribeGuestFetch = (guestId: string) => ({
  type: "guests/UNSUBSCRIBE" as "guests/UNSUBSCRIBE",
  payload: guestId
});

export const setGuestsOrder = (idOrder: string[], hasMore?: boolean) => ({
  type: "guests/APPLY_ORDER" as "guests/APPLY_ORDER",
  payload: {
    order: idOrder,
    hasMore
  }
});

export const setCurrentQueryPage = (page: number): ISetCurrentQueryPageNumber => ({
  type: "guests/SET_CURRENT_PAGE_NUMBER",
  payload: page
});

export const checkGuests = (ids: string[]) => {
  if (ids.length) {
    return { type: "TICK_GUESTS" as "TICK_GUESTS", payload: ids };
  }
  return { type: "TICK_ALL_GUESTS" as "TICK_ALL_GUESTS" };
};

export const uncheckGuests = (ids: string[]) => {
  if (ids.length) {
    return { type: "UNTICK_GUESTS" as "UNTICK_GUESTS", payload: ids };
  }
  return { type: "UNTICK_ALL_GUESTS" as "UNTICK_ALL_GUESTS" };
};

export const deleteGuestSuccess = (guestId: string) => ({
  type: "guests/DELETE_GUEST_SUCCESS" as "guests/DELETE_GUEST_SUCCESS",
  payload: guestId
});

type TFetchGuestSuccess = ReturnType<typeof fetchGuestSuccess> & { meta?: { subscribed?: boolean } };
type TUpdateGuestSuccess = ReturnType<typeof updateGuestSuccess>;
type TGuestUnsubscribe = ReturnType<typeof unsubscribeGuestFetch>;
type TApplyGuestOrder = ReturnType<typeof setGuestsOrder>;
type TCheckGuests = ReturnType<typeof checkGuests>;
type TUncheckGuests = ReturnType<typeof uncheckGuests>;
type TDeleteGuestSuccess = ReturnType<typeof deleteGuestSuccess>;

export type TActions =
  | IAddGuests
  | IAddGuestsSuccess
  | IFetchGuest
  | TFetchGuestSuccess
  | IFetchGuestError
  | TApplyGuestOrder
  | ISetCurrentQueryPageNumber
  | TUpdateGuestSuccess
  | TCheckGuests
  | TUncheckGuests
  | TGuestUnsubscribe
  | TDeleteGuestSuccess;

export const initialState: IGuestsReducer = {
  byId: {},
  order: [],
  checked: [],
  currentPageNumber: 0,
  hasMore: true,
  subscribed: {}
};
