import { IGuest } from "./types";
import shortId from "shortid";
import { useReducer } from "react";

export interface INewGuest extends Omit<IGuest, "weddingId"> {}

interface IReducerState {
  byId: { [id: string]: INewGuest };
  order: string[];
  checkedGuests: {
    [id: string]: boolean;
  };
}

interface IUpdateGuestAction {
  type: "update";
  payload: {
    id: string;
    data: Pick<INewGuest, "email" | "preferredName"> | Pick<INewGuest, "name">;
  };
}

interface IRemoveGuestAction {
  type: "remove";
  payload: {
    ids: string[];
  };
}

interface IAddGuestAction {
  type: "append";
  payload?: INewGuest[];
}

interface ITickGuestAction {
  type: "tick";
  payload?: {
    id: string;
  };
}

interface ICoupleActionPayload {
  payload: {
    partner1Id: string;
    partner2Id: string;
  };
}

interface ILinkCoupleAction extends ICoupleActionPayload {
  type: "link_couple";
}

interface IUnlinkCoupleAction extends ICoupleActionPayload {
  type: "unlink_couple";
}

type IActions =
  | IUpdateGuestAction
  | IRemoveGuestAction
  | IAddGuestAction
  | ITickGuestAction
  | ILinkCoupleAction
  | IUnlinkCoupleAction;

const defaultGuestId = shortId.generate();

const initialState = {
  byId: {
    [defaultGuestId]: { id: defaultGuestId, name: "", preferredName: "", email: "" }
  },
  order: [defaultGuestId],
  checkedGuests: {},
  newGroups: {}
};

function newGuestsReducer(state: IReducerState, action: IActions) {
  switch (action.type) {
    case "update":
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: { ...state.byId[action.payload.id], ...action.payload.data }
        }
      };
    case "remove":
      const clonedGuests = { ...state.byId };
      const clonedOrder = [...state.order];
      action.payload.ids.forEach(id => {
        delete clonedGuests[id];
        clonedOrder.splice(clonedOrder.indexOf(id), 1);
      });
      return {
        ...state,
        byId: clonedGuests,
        order: clonedOrder
      };
    case "append":
      const id = shortId.generate();
      return {
        ...state,
        byId: {
          ...state.byId,
          [id]: { id, name: "", preferredName: "", email: "" }
        },
        order: [...state.order, id]
      };
    case "tick":
      return {
        ...state,
        checkedGuests: action.payload
          ? {
              ...state.checkedGuests,
              [action.payload.id]: !state.checkedGuests[action.payload.id]
            }
          : {}
      };
    case "link_couple": {
      return {
        ...state,
        byId: {
          ...state.byId,
          ...(state.byId[action.payload.partner1Id]
            ? {
                [action.payload.partner1Id]: {
                  ...state.byId[action.payload.partner1Id],
                  partnerId: action.payload.partner2Id
                }
              }
            : {}),
          ...(state.byId[action.payload.partner2Id]
            ? {
                [action.payload.partner2Id]: {
                  ...state.byId[action.payload.partner2Id],
                  partnerId: action.payload.partner1Id
                }
              }
            : {})
        }
      };
    }
    case "unlink_couple": {
      return {
        ...state,
        byId: {
          ...state.byId,
          ...(state.byId[action.payload.partner1Id]
            ? {
                [action.payload.partner1Id]: {
                  ...state.byId[action.payload.partner1Id],
                  partnerId: undefined
                }
              }
            : {}),
          ...(state.byId[action.payload.partner2Id]
            ? {
                [action.payload.partner2Id]: {
                  ...state.byId[action.payload.partner2Id],
                  partnerId: undefined
                }
              }
            : {})
        }
      };
    }
    default:
      return state;
  }
}

export default function useNewGuestsReducer(defaultState = initialState) {
  const [state, dispatch] = useReducer(newGuestsReducer, defaultState);
  const checkedList = Object.keys(state.checkedGuests).filter(id => !!state.checkedGuests[id]);
  const guests = state.order.map(id => state.byId[id]);

  return {
    ...state,
    guests,
    checkedList,
    dispatch,
    actions: {
      append: (data?: IAddGuestAction["payload"]) => dispatch({ type: "append", ...(data ? { payload: data } : {}) }),
      remove: (ids: string[]) => dispatch({ type: "remove", payload: { ids } }),
      update: (id: string, data: IUpdateGuestAction["payload"]["data"]) =>
        dispatch({
          type: "update",
          payload: { id, data }
        }),
      tick: (id?: string) => dispatch({ type: "tick", ...(id ? { payload: { id } } : {}) }),
      linkCouple: (partner1Id: string, partner2Id: string) =>
        dispatch({ type: "link_couple", payload: { partner1Id, partner2Id } }),
      unlinkCouple: (partner1Id: string, partner2Id: string) =>
        dispatch({ type: "unlink_couple", payload: { partner1Id, partner2Id } })
    }
  };
}
