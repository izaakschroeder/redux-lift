
/**
 * [initialState description]
 * @param   {[type]} liftInitialState [description]
 * @returns {[type]}                  [description]
 */
export function liftState(initialState, liftedInitialState) {
  return [
    initialState,
    liftedInitialState,
  ];
}

export function unliftState(state) {
  return state[0];
}

export function liftAction(type, action) {
  return {
    type,
    payload: action
  };
}

export function unliftAction({ payload }) {
  return payload;
}

export function unliftStore(store) {
  return {
    ...store,
    replaceReducer() {
      throw new TypeError('Cannot mutate inner store.');
    },
    getState() {
      return unliftState(store.getState());
    }
  }
}

export function liftStore(store, liftReducer, liftDispatch) {
  return {
    ...store,
    parent: {
      ...unliftStore(store),
      dispatch: liftDispatch(store.dispatch)
    },
    replaceReducer(reducer) {
      return store.replaceReducer(liftReducer(reducer));
    }
  }
}

export function lift({
  liftInitialState,
  liftReducer,
  liftDispatch,
}) {
  return (next : Function) : Function => {
    return (reducer : Function, initialState : any) => liftStore(
      next(liftReducer(reducer), liftInitialState(initialState)),
      liftReducer,
      liftDispatch
    );
  }
}
