import { initialState, TActions } from "./guests-actions";
import { IGuest } from "./types";

export interface IGuestsReducer {
  byId: {
    [id: string]: IGuest;
  };
  order: string[];
  checked: string[];
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
        order: action.payload
      };
    case "guests/SET_CURRENT_PAGE_NUMBER":
      return {
        ...state,
        currentPageNumber: action.payload
      };
    case "guests/FETCH_SUCCESS":
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: action.payload
        }
      };
    case "guests/UPDATE_SUCCESS":
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: { ...state.byId[action.payload.id], ...action.payload }
        }
      };
    default:
      return state;
  }
}
