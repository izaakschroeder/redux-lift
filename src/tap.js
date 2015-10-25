
function noop() {

}

/**
 * Create an initial state function that just passes the original state through.
 * @returns {Function} Identity intitial state function.
 */
export function initialState(f) : Function {
  return (initialState : any) : any =>
    (f(initialState), initialState);
}

/**
 * Create a reducer that simply invokes its child reducer.
 * @returns {Function} Identity reducer function.
 */
export function reducer(f) : Function {
  return (parent : Function) =>
    (state : any, action : Object) =>
      (f(state, action), parent(state, action));
}

/**
 * Create a dispatcher that simply dispatches to its parent.
 * @returns {Function} Identity dispatch function.
 */
export function dispatch(f) : Function {
  return (dispatch : Function) =>
    (action : Object) =>
      (f(action), dispatch(action));
}

/**
 * Create an identity lift.
 * @returns {Object} All the lifted functions.
 */
export default function identity({
  reducer: tapReducer = noop,
  initialState: tapInitialState = noop,
  dispatch: tapDispatch = noop
} = { }) {
  return {
    reducer: reducer(tapReducer),
    initialState: initialState(tapInitialState),
    dispatch: dispatch(tapDispatch),
  };
}
