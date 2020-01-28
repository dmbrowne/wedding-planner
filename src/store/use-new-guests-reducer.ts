import { IGuest } from "./types";
import { IGuestGroup } from "./guest-groups";
import shortId from "shortid";
import { useReducer } from "react";
import { useStateSelector } from "./redux";

export interface INewGuest extends Omit<IGuest, "weddingId"> {}
export interface INewGuestGroup extends Omit<IGuestGroup, "weddingId"> {}

interface IReducerState {
  byId: { [id: string]: INewGuest };
  order: string[];
  checkedGuests: {
    [id: string]: boolean;
  };
  newGroups: {
    [id: string]: IGuestGroup;
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

interface IAddNewGroupAction {
  type: "add_new_group";
  payload: Omit<IGuestGroup, "id">;
}
interface IRemoveNewGroupAction {
  type: "remove_new_group";
  payload: { id: string };
}

interface IGuestToGroupActionPayload {
  payload: {
    guestId: string;
    groupId: string;
  };
}
interface IAddGuestToGroupAction extends IGuestToGroupActionPayload {
  type: "add_guest_to_group";
}
interface IRemoveGuestToGroupAction extends IGuestToGroupActionPayload {
  type: "remove_guest_from_group";
}

type IActions =
  | IUpdateGuestAction
  | IRemoveGuestAction
  | IAddGuestAction
  | ITickGuestAction
  | ILinkCoupleAction
  | IUnlinkCoupleAction
  | IAddNewGroupAction
  | IRemoveNewGroupAction
  | IAddGuestToGroupAction
  | IRemoveGuestToGroupAction;

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
    case "add_new_group":
      const newId = shortId.generate();
      return {
        ...state,
        newGroups: {
          ...state.newGroups,
          [newId]: { id: newId, ...action.payload }
        },
        byId: {
          ...state.byId,
          ...action.payload.members.reduce(
            (accum, guestId) => ({
              ...accum,
              [guestId]: {
                ...state.byId[guestId],
                groupIds: [...(state.byId[guestId].groupIds || []), newId]
              }
            }),
            {} as any
          )
        }
      };
    case "remove_new_group":
      const clonedGroups = { ...state.newGroups };
      const group = state.newGroups[action.payload.id];
      delete clonedGroups[action.payload.id];
      const updatedGuests =
        group.members &&
        group.members.reduce((accum, guestId) => {
          const guest = state.byId[guestId];
          return {
            ...accum,
            [guestId]: {
              ...guest,
              groupsIds: guest.groupIds
                ? guest.groupIds.filter(groupId => groupId !== action.payload.id)
                : guest.groupIds
            }
          };
        }, {});
      return {
        ...state,
        byId: {
          ...state.byId,
          ...updatedGuests
        },
        newGroups: clonedGroups
      };
    case "add_guest_to_group": {
      const guest = state.byId[action.payload.guestId];
      const updatedGuest = {
        ...guest,
        groupIds: guest.groupIds
          ? guest.groupIds.includes(action.payload.groupId)
            ? guest.groupIds
            : [...guest.groupIds, action.payload.groupId]
          : [action.payload.groupId]
      };
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.guestId]: updatedGuest
        }
      };
    }
    case "remove_guest_from_group": {
      const guest = state.byId[action.payload.guestId];
      let updatedGroupIds;
      if (guest.groupIds) {
        updatedGroupIds = [...guest.groupIds];
        updatedGroupIds.splice(updatedGroupIds.indexOf(action.payload.groupId), 1);
      }
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.guestId]: {
            ...guest,
            groupIds: updatedGroupIds || guest.groupIds
          }
        }
      };
    }
    default:
      return state;
  }
}

export default function useNewGuestsReducer(defaultState = initialState) {
  const [state, dispatch] = useReducer(newGuestsReducer, defaultState);
  const weddingId = useStateSelector(state => state.activeWeddingId);
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
        dispatch({ type: "unlink_couple", payload: { partner1Id, partner2Id } }),

      addNewGroup: (details: Omit<INewGuestGroup, "id">) =>
        dispatch({ type: "add_new_group", payload: { ...details, weddingId } }),
      deleteNewGroup: (id: string) => dispatch({ type: "remove_new_group", payload: { id } }),
      addGuestToGroup: (guestId: string, groupId: string) =>
        dispatch({ type: "add_guest_to_group", payload: { groupId, guestId } }),
      removeGuestFromGroup: (guestId: string, groupId: string) =>
        dispatch({ type: "remove_guest_from_group", payload: { groupId, guestId } })
    }
  };
}
