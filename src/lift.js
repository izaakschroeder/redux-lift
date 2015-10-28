
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
  return state;
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
