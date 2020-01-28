import { initialState, TActions } from "./guests-actions";
import { IGuest } from "./types";

export interface IGuestsReducer {
  subscribed: {
    [id: string]: boolean;
  };
  byId: {
    [id: string]: IGuest;
  };
  order: string[];
  checked: string[];
  currentPageNumber: number;
  hasMore: boolean;
}

export default function guestsReducer(state = initialState, action: TActions) {
  switch (action.type) {
    case "TICK_GUESTS":
      return {
        ...state,
        checked: [...state.checked, ...action.payload.filter(id => !state.checked.includes(id))]
      };
    case "UNTICK_GUESTS":
      return {
        ...state,
        checked: state.checked.filter(id => !state.checked.includes(id))
      };
    case "guests/APPLY_ORDER":
      return {
        ...state,
        order: action.payload.order,
        hasMore: action.payload.hasMore
      };
    case "guests/SET_CURRENT_PAGE_NUMBER":
      return {
        ...state,
        currentPageNumber: action.payload
      };
    case "guests/FETCH":
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.guestId]: {
            fetching: true
          }
        }
      };
    case "guests/FETCH_SUCCESS":
      return {
        ...state,
        // unless specifically given in the action, the subscribe propert should stay the same
        subscribed: {
          ...state.subscribed,
          [action.payload.id]:
            action.meta && typeof action.meta.subscribed !== "undefined"
              ? action.meta.subscribed
              : state.subscribed[action.payload.id]
        },
        byId: {
          ...state.byId,
          [action.payload.id]: {
            ...action.payload,
            fetching: false
          }
        }
      };
    case "guests/UNSUBSCRIBE":
      return {
        ...state,
        subscribed: {
          ...state.subscribed,
          [action.payload]: false
        }
      };
    case "guests/UPDATE_SUCCESS":
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: { ...action.payload, fetching: false }
        }
      };
    default:
      return state;
  }
}
