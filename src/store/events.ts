import { IEvent, IEventGuest, IPlusOneGuest } from "./types";

export interface IReducer {
  eventsById: {
    [eventId: string]: Omit<IEvent, "guests">;
  };
  eventsOrder: string[];
  eventGuestOrder: string[];
  eventGuests: {
    [guestId: string]: IEventGuest;
  };
  plusOnes: {
    [id: string]: IPlusOneGuest;
  };
}

export const fetchEventSuccess = (event: IEvent) => ({
  type: "events/FETCH_SUCCESS" as "events/FETCH_SUCCESS",
  payload: event
});

export const updateEventSuccess = (event: IEvent) => ({
  type: "events/UPDATE_SUCCESS" as "events/UPDATE_SUCCESS",
  payload: event
});

export const deleteEventSuccess = (eventId: string) => ({
  type: "events/DELETE_SUCCESS" as "events/DELETE_SUCCESS",
  payload: eventId
});

export const fetchEventGuestSuccess = (guest: IEventGuest) => ({
  type: "events/FETCH_GUEST_SUCCESS" as "events/FETCH_GUEST_SUCCESS",
  payload: guest
});

export const updateEventGuestSuccess = (guest: IEventGuest) => ({
  type: "events/UPDATE_GUEST_SUCCESS" as "events/UPDATE_GUEST_SUCCESS",
  payload: guest
});

export const deleteEventGuestSuccess = (guestId: string) => ({
  type: "events/DELETE_GUEST_SUCCESS" as "events/DELETE_GUEST_SUCCESS",
  payload: guestId
});

export const fetchPlusOneSuccess = (plusOne: IPlusOneGuest) => ({
  type: "events/FETCH_PLUS_ONE_SUCCESS" as "events/FETCH_PLUS_ONE_SUCCESS",
  payload: plusOne
});

export const updatePlusOneSuccess = (plusOne: IPlusOneGuest) => ({
  type: "events/UPDATE_PLUS_ONE_SUCCESS" as "events/UPDATE_PLUS_ONE_SUCCESS",
  payload: plusOne
});

export const deletePlusOneSuccess = (plusOneId: string) => ({
  type: "events/DELETE_PLUS_ONE_SUCCESS" as "events/DELETE_PLUS_ONE_SUCCESS",
  payload: plusOneId
});

export const applyGuestListingOrder = (ids: string[]) => ({
  type: "events/APPLY_GUEST_ORDER" as "events/APPLY_GUEST_ORDER",
  payload: ids
});

export const applyEventListingOrder = (ids: string[]) => ({
  type: "events/APPLY_EVENT_ORDER" as "events/APPLY_EVENT_ORDER",
  payload: ids
});

type TFetchEventSuccess = ReturnType<typeof fetchEventSuccess>;
type TUpdateEventSuccess = ReturnType<typeof updateEventSuccess>;
type TDeleteEventSuccess = ReturnType<typeof deleteEventSuccess>;
type TFetchEventGuestSuccess = ReturnType<typeof fetchEventGuestSuccess>;
type TUpdateEventGuestSuccess = ReturnType<typeof updateEventGuestSuccess>;
type TDeleteEventGuestSuccess = ReturnType<typeof deleteEventGuestSuccess>;
type TFetchPlusOneSuccess = ReturnType<typeof fetchPlusOneSuccess>;
type TUpdatePlusOneSuccess = ReturnType<typeof updatePlusOneSuccess>;
type TDeletePlusOneSuccess = ReturnType<typeof deletePlusOneSuccess>;
type TGuestOrder = ReturnType<typeof applyGuestListingOrder>;
type TEventsOrder = ReturnType<typeof applyEventListingOrder>;
type TActions =
  | TFetchEventSuccess
  | TUpdateEventSuccess
  | TDeleteEventSuccess
  | TFetchEventGuestSuccess
  | TDeleteEventGuestSuccess
  | TUpdateEventGuestSuccess
  | TFetchPlusOneSuccess
  | TUpdatePlusOneSuccess
  | TDeletePlusOneSuccess
  | TGuestOrder
  | TEventsOrder;

const initalState: IReducer = {
  eventGuestOrder: [],
  eventsOrder: [],
  eventsById: {},
  eventGuests: {},
  plusOnes: {}
};

export default function eventsReducer(state: IReducer = initalState, action: TActions) {
  switch (action.type) {
    case "events/FETCH_SUCCESS":
      return {
        ...state,
        eventsById: {
          ...state.eventsById,
          [action.payload.id]: action.payload
        }
      };
    case "events/UPDATE_SUCCESS":
      return {
        ...state,
        eventsById: {
          ...state.eventsById,
          [action.payload.id]: {
            ...state.eventsById[action.payload.id],
            ...action.payload
          }
        }
      };
    case "events/FETCH_GUEST_SUCCESS":
    case "events/UPDATE_GUEST_SUCCESS":
      return {
        ...state,
        eventGuests: {
          ...state.eventGuests,
          [action.payload.id]: action.payload
        }
      };
    case "events/DELETE_GUEST_SUCCESS": {
      const guests = { ...state.eventGuests };
      delete guests[action.payload];
      return {
        ...state,
        eventGuests: guests
      };
    }
    case "events/FETCH_PLUS_ONE_SUCCESS":
      return {
        ...state,
        plusOnes: {
          ...state.plusOnes,
          [action.payload.id]: action.payload
        }
      };
    case "events/UPDATE_PLUS_ONE_SUCCESS":
      return {
        ...state,
        plusOnes: {
          ...state.plusOnes,
          [action.payload.id]: {
            ...state.plusOnes[action.payload.id],
            ...action.payload
          }
        }
      };
    case "events/DELETE_PLUS_ONE_SUCCESS":
      const plusOnes = { ...state.plusOnes };
      delete plusOnes[action.payload];
      return {
        ...state,
        plusOnes: plusOnes
      };
    case "events/APPLY_GUEST_ORDER":
      return {
        ...state,
        eventGuestOrder: action.payload
      };
    case "events/APPLY_EVENT_ORDER":
      return {
        ...state,
        eventsOrder: action.payload
      };
    default:
      return state;
  }
}
