import { Thunk } from "./redux";
import firebase from "firebase/app";

export interface IGuestGroup {
  id: string;
  name: string;
  members: string[];
  jointInvitations?: boolean;
  fetching?: boolean;
  weddingId: string;
}

export interface IReducer {
  byId: {
    [id: string]: IGuestGroup;
  };
}

export const createGuestGroups = (groups: Omit<IGuestGroup, "weddingId">[]): Thunk<void, any> => async (
  dispatch,
  getState
) => {
  const weddingId = getState().activeWeddingId;
  const db = firebase.firestore();

  dispatch({ type: "guestGroups/CREATE", payload: groups });

  try {
    if (groups.length === 1) {
      await db.doc(`guestGroups/${groups[0].id}`).set({ ...groups[0], weddingId });
    } else {
      const batch = db.batch();
      groups.forEach(group => {
        const ref = db.doc(`guestGroups/${group.id}`);
        batch.set(ref, group);
      });
      await batch.commit();
    }
    dispatch({ type: "guestGroups/CREATE_SUCCESS", payload: groups });
  } catch (e) {
    dispatch({ type: "guestGroups/CREATE_ERROR", payload: e });
  }
};

export const fetchGroupSuccess = (group: IGuestGroup) => ({
  type: "guestGroups/FETCH_SUCCESS" as "guestGroups/FETCH_SUCCESS",
  payload: group
});

type TFetchGroupSuccess = ReturnType<typeof fetchGroupSuccess>;
type TActions = TFetchGroupSuccess;

const defaultState: IReducer = {
  byId: {}
};

export default function guestGroupsReducer(state: IReducer = defaultState, action: TActions) {
  switch (action.type) {
    case "guestGroups/FETCH_SUCCESS":
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.payload.id]: action.payload
        }
      };
    default:
      return state;
  }
}
