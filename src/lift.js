
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
