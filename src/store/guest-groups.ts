export interface IGuestGroup {
  id: string;
  name: string;
  memberIds: string[];
  weddingId: string;
}

export interface IReducer {
  order: string[];
  byId: {
    [id: string]: IGuestGroup;
  };
}

export const fetchGroupSuccess = (group: IGuestGroup) => ({
  type: "guestGroups/FETCH_SUCCESS" as "guestGroups/FETCH_SUCCESS",
  payload: group
});

export const deleteGroupSuccess = (groupId: string) => ({
  type: "guestGroups/DELETE_SUCCESS" as "guestGroups/DELETE_SUCCESS",
  payload: groupId
});

export const applyOrder = (idOrder: string[]) => ({
  type: "guestGroups/APPLY_ORDER" as "guestGroups/APPLY_ORDER",
  payload: idOrder
});

type TFetchGroupSuccess = ReturnType<typeof fetchGroupSuccess>;
type TDeleteGroupSuccess = ReturnType<typeof deleteGroupSuccess>;
type TApplyOrder = ReturnType<typeof applyOrder>;
type TActions = TFetchGroupSuccess | TDeleteGroupSuccess | TApplyOrder;

const defaultState: IReducer = {
  order: [],
  byId: {}
};

export default function guestGroupsReducer(state: IReducer = defaultState, action: TActions) {
  switch (action.type) {
    case "guestGroups/APPLY_ORDER":
      return {
        ...state,
        order: action.payload
      };
    case "guestGroups/FETCH_SUCCESS":
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: action.payload
        }
      };
    case "guestGroups/DELETE_SUCCESS":
      const cloned = { ...state.byId };
      delete cloned[action.payload];
      return {
        ...state,
        order: state.order.filter(id => id !== action.payload),
        byId: cloned
      };
    default:
      return state;
  }
}
