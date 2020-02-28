import { IUser, IWedding } from "./types";

export const fetchWeddingSuccess = (wedding: IWedding) => ({
  type: "active-wedding/FETCH_SUCCESS" as "active-wedding/FETCH_SUCCESS",
  payload: wedding,
});

export const setWeddingCollaborators = (collaborators: { [id: string]: IUser }) => ({
  type: "active-wedding/SET_COLLABORATORS" as "active-wedding/SET_COLLABORATORS",
  payload: collaborators,
});

type TActions = ReturnType<typeof fetchWeddingSuccess> | ReturnType<typeof setWeddingCollaborators>;

export interface IWeddngReducerState {
  wedding: IWedding | null;
  collaborators: { [id: string]: IUser };
}

const initialState: IWeddngReducerState = { wedding: null, collaborators: {} };

export function activeWeddingReducer(state: IWeddngReducerState = initialState, action: TActions) {
  switch (action.type) {
    case "active-wedding/FETCH_SUCCESS":
      return { ...state, wedding: action.payload };
    case "active-wedding/SET_COLLABORATORS":
      return { ...state, collaborators: action.payload };
    default:
      return state;
  }
}
