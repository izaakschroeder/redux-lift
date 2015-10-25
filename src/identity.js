
/**
 * Create an initial state function that just passes the original state through.
 * @returns {Function} Identity intitial state function.
 */
export function initialState() : Function {
  return (initialState : any) : any =>
    initialState;
}

/**
 * Create a reducer that simply invokes its child reducer.
 * @returns {Function} Identity reducer function.
 */
export function reducer() : Function {
  return (parent : Function) =>
    (state : any, action : Object) =>
      parent(state, action);
}

/**
 * Create a dispatcher that simply dispatches to its parent.
 * @returns {Function} Identity dispatch function.
 */
export function dispatch() : Function {
  return (dispatch : Function) =>
    (action : Object) =>
      dispatch(action);
}

/**
 * Create an identity lift.
 * @returns {Object} All the lifted functions.
 */
export default function identity() {
  return {
    reducer: reducer(),
    initialState: initialState(),
    dispatch: dispatch(),
  };
}
