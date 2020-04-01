import { ReactNode } from "react";

import React from "react";
import { createStore, PreloadedState, Store } from "redux";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import reducers from "../store/reducers";

type ReduxOpts<S> = { initialState?: PreloadedState<S>; store?: Store };

export function withRedux<S = any>(children: ReactNode, { initialState, store }: ReduxOpts<S> = {}) {
  return {
    ui: <Provider store={store || initialState ? createStore(reducers, initialState) : createStore(reducers)}>{children}</Provider>,
    store,
  };
}

export function renderWithRedux<S = any>(ui: ReactNode, opts?: ReduxOpts<S>) {
  const { ui: reduxUI, store } = withRedux(ui, opts);
  return {
    ...render(reduxUI),
    store,
  };
}
