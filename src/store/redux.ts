import { createStore, applyMiddleware, Action, compose } from "redux";
import thunk, { ThunkAction } from "redux-thunk";

import reducers, { IRootReducer } from "./reducers";
import { useSelector } from "react-redux";

export type Thunk<R, A extends Action> = ThunkAction<R, IRootReducer, {}, A>;

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducers, composeEnhancers(applyMiddleware(thunk)));

export function useStateSelector<TSelected = unknown>(
  selector: (state: IRootReducer) => TSelected,
  equalityFn?: (left: TSelected, right: TSelected) => boolean
) {
  return useSelector(selector, equalityFn);
}

export default store;
