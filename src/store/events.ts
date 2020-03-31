import { IEvent, IEventGuest, IPlusOneGuest, IAmenity } from "./types";

export interface IReducer {
  subscriptions: {
    allEvents?: boolean;
    allAmenties?: boolean;
  };
  eventsById: {
    [eventId: string]: Omit<IEvent, "guests">;
  };
  eventsOrder: string[];
  eventGuestOrder: string[];
  eventGuests: {
    [eventGuestId: string]: IEventGuest;
  };
  eventGuestsByGuestId: {
    [guestId: string]: string;
  };
  eventGuestsByEventId: {
    [eventId: string]: string[];
  };
  plusOnes: {
    [id: string]: IPlusOneGuest;
  };
  amenitiesById: {
    [id: string]: IAmenity;
  };
  amenitiesOrder: string[];
}

export const setSubscription = (key: keyof IReducer["subscriptions"], value: boolean) => ({
  type: "events/SET_SUBSCRIPTION" as "events/SET_SUBSCRIPTION",
  payload: { key, value },
});

export const fetchEventSuccess = (event: IEvent) => ({
  type: "events/FETCH_SUCCESS" as "events/FETCH_SUCCESS",
  payload: event,
});

export const updateEventSuccess = (event: IEvent) => ({
  type: "events/UPDATE_SUCCESS" as "events/UPDATE_SUCCESS",
  payload: event,
});

export const deleteEventSuccess = (eventId: string) => ({
  type: "events/DELETE_SUCCESS" as "events/DELETE_SUCCESS",
  payload: eventId,
});

export const fetchEventGuestSuccess = (guest: IEventGuest) => ({
  type: "events/FETCH_GUEST_SUCCESS" as "events/FETCH_GUEST_SUCCESS",
  payload: guest,
});

export const updateEventGuestSuccess = (guest: IEventGuest) => ({
  type: "events/UPDATE_GUEST_SUCCESS" as "events/UPDATE_GUEST_SUCCESS",
  payload: guest,
});

export const deleteEventGuestSuccess = (guestId: string) => ({
  type: "events/DELETE_GUEST_SUCCESS" as "events/DELETE_GUEST_SUCCESS",
  payload: guestId,
});

export const fetchPlusOneSuccess = (plusOne: IPlusOneGuest) => ({
  type: "events/FETCH_PLUS_ONE_SUCCESS" as "events/FETCH_PLUS_ONE_SUCCESS",
  payload: plusOne,
});

export const updatePlusOneSuccess = (plusOne: IPlusOneGuest) => ({
  type: "events/UPDATE_PLUS_ONE_SUCCESS" as "events/UPDATE_PLUS_ONE_SUCCESS",
  payload: plusOne,
});

export const deletePlusOneSuccess = (plusOneId: string) => ({
  type: "events/DELETE_PLUS_ONE_SUCCESS" as "events/DELETE_PLUS_ONE_SUCCESS",
  payload: plusOneId,
});

export const applyGuestListingOrder = (ids: string[]) => ({
  type: "events/APPLY_GUEST_ORDER" as "events/APPLY_GUEST_ORDER",
  payload: ids,
});

export const applyEventListingOrder = (ids: string[]) => ({
  type: "events/APPLY_EVENT_ORDER" as "events/APPLY_EVENT_ORDER",
  payload: ids,
});

export const setAmenityOrder = (idOrder: string[]) => ({
  type: "events/SET_AMENITIES_ORDER" as "events/SET_AMENITIES_ORDER",
  payload: idOrder,
});

export const fetchAmenitySuccess = (amenity: IAmenity) => ({
  type: "events/FETCH_AMENITY_SUCCESS" as "events/FETCH_AMENITY_SUCCESS",
  payload: amenity,
});

export const deleteAmenitySuccess = (amenityId: string) => ({
  type: "events/DELETE_AMENITY_SUCCESS" as "events/DELETE_AMENITY_SUCCESS",
  payload: amenityId,
});

type TActions =
  | ReturnType<typeof fetchEventSuccess>
  | ReturnType<typeof updateEventSuccess>
  | ReturnType<typeof deleteEventSuccess>
  | ReturnType<typeof fetchEventGuestSuccess>
  | ReturnType<typeof updateEventGuestSuccess>
  | ReturnType<typeof deleteEventGuestSuccess>
  | ReturnType<typeof fetchPlusOneSuccess>
  | ReturnType<typeof updatePlusOneSuccess>
  | ReturnType<typeof deletePlusOneSuccess>
  | ReturnType<typeof applyGuestListingOrder>
  | ReturnType<typeof applyEventListingOrder>
  | ReturnType<typeof setAmenityOrder>
  | ReturnType<typeof fetchAmenitySuccess>
  | ReturnType<typeof deleteAmenitySuccess>
  | ReturnType<typeof setSubscription>;

const initalState: IReducer = {
  subscriptions: {},
  eventGuestOrder: [],
  eventsOrder: [],
  eventsById: {},
  eventGuests: {},
  eventGuestsByGuestId: {},
  eventGuestsByEventId: {},
  plusOnes: {},
  amenitiesById: {},
  amenitiesOrder: [],
};

export default function eventsReducer(state: IReducer = initalState, action: TActions) {
  switch (action.type) {
    case "events/FETCH_SUCCESS":
      return {
        ...state,
        eventsById: {
          ...state.eventsById,
          [action.payload.id]: action.payload,
        },
      };
    case "events/UPDATE_SUCCESS":
      return {
        ...state,
        eventsById: {
          ...state.eventsById,
          [action.payload.id]: {
            ...state.eventsById[action.payload.id],
            ...action.payload,
          },
        },
      };
    case "events/FETCH_GUEST_SUCCESS":
    case "events/UPDATE_GUEST_SUCCESS":
      return {
        ...state,
        eventGuests: {
          ...state.eventGuests,
          [action.payload.id]: action.payload,
        },
        eventGuestsByGuestId: {
          ...state.eventGuestsByGuestId,
          [action.payload.guestId]: action.payload.id,
        },
        eventGuestsByEventId: {
          ...state.eventGuestsByEventId,
          [action.payload.eventId]:
            state.eventGuestsByEventId[action.payload.eventId] &&
            state.eventGuestsByEventId[action.payload.eventId].includes(action.payload.id)
              ? state.eventGuestsByEventId[action.payload.eventId]
              : [...(state.eventGuestsByEventId[action.payload.eventId] || []), action.payload.id],
        },
      };
    case "events/DELETE_GUEST_SUCCESS": {
      const { eventId } = state.eventGuests[action.payload];
      const guests = { ...state.eventGuests };
      delete guests[action.payload];
      const eventGuestsForEvent = state.eventGuestsByEventId[eventId];
      return {
        ...state,
        eventGuests: guests,
        eventGuestsByGuestId: Object.entries(state.eventGuestsByGuestId).reduce(
          (accum: { [guestId: string]: string }, [guestId, eventGuestId]) => {
            return action.payload === eventGuestId ? accum : { ...accum, [guestId]: eventGuestId };
          },
          {}
        ),
        eventGuestsByEventId: {
          ...state.eventGuestsByEventId,
          ...(eventGuestsForEvent
            ? { [eventId]: state.eventGuestsByEventId[eventId].filter(eventGuestId => eventGuestId !== action.payload) }
            : {}),
        },
      };
    }
    case "events/FETCH_PLUS_ONE_SUCCESS":
      return {
        ...state,
        plusOnes: {
          ...state.plusOnes,
          [action.payload.id]: action.payload,
        },
      };
    case "events/UPDATE_PLUS_ONE_SUCCESS":
      return {
        ...state,
        plusOnes: {
          ...state.plusOnes,
          [action.payload.id]: {
            ...state.plusOnes[action.payload.id],
            ...action.payload,
          },
        },
      };
    case "events/DELETE_PLUS_ONE_SUCCESS":
      const plusOnes = { ...state.plusOnes };
      delete plusOnes[action.payload];
      return {
        ...state,
        plusOnes: plusOnes,
      };
    case "events/APPLY_GUEST_ORDER":
      return {
        ...state,
        eventGuestOrder: action.payload,
      };
    case "events/APPLY_EVENT_ORDER":
      return {
        ...state,
        eventsOrder: action.payload,
      };
    case "events/FETCH_AMENITY_SUCCESS":
      return {
        ...state,
        amenitiesById: {
          ...state.amenitiesById,
          [action.payload.id]: action.payload,
        },
      };
    case "events/DELETE_AMENITY_SUCCESS":
      return {
        ...state,
        amenitiesOrder: state.amenitiesOrder.filter(id => id !== action.payload),
        amenitiesById: Object.entries(state.amenitiesById).reduce((accum, [id, amenity]) => {
          return id === action.payload ? accum : { ...accum, [id]: amenity };
        }, {} as IReducer["amenitiesById"]),
      };
    case "events/SET_AMENITIES_ORDER":
      return {
        ...state,
        amenitiesOrder: action.payload,
      };
    case "events/SET_SUBSCRIPTION":
      return {
        ...state,
        subscriptions: {
          ...state.subscriptions,
          [action.payload.key]: action.payload.value,
        },
      };
    default:
      return state;
  }
}
