
import {
  liftState,
  unliftState,
  liftAction,
  unliftAction,
  lift,
} from './lift';
import isPromise from 'is-promise';

function liftReducer(reducer) {
  return (state, action) => {
    const [child, promises] = state;
    switch(action.type) {
    case 'PROMISE_DISPATCH':
      return liftState(
        unliftState(state),
        [ ...promises, action.action.payload ]
      );
    case 'PROMISE_ERROR':
    case 'PROMISE_RESULT':
      return liftState(reducer(child, {
        type: action.action.type,
        payload: action.payload,
        error: action.error,
      }), promises);
    case 'CHILD':
      return liftState(
        reducer(unliftState(state), unliftAction(action)),
        promises
      );
    default:
      return state;
    }
  }
}

function liftInitialState(initialState) {
  return liftState(initialState, []);
}

function liftDispatch(dispatch) {
  return (action) => {
    if (isPromise(action.payload)) {
      dispatch({ type: 'PROMISE_DISPATCH', action });
      return action.payload.then(payload => {
        dispatch({ type: 'PROMISE_RESULT', action, payload });
      }, payload => {
        dispatch({ type: 'PROMISE_ERROR', action, payload, error: true });
      });
    }
    return dispatch(liftAction('CHILD', action));
  }
}

export default lift({
  liftReducer,
  liftInitialState,
  liftDispatch
});
