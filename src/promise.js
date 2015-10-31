
import { isFSA } from 'flux-standard-action';
import isPromise from 'is-promise';

import {
  liftAction,
  unliftAction,
  unliftReducer,
  lift,
} from './lift';

// https://github.com/acdlite/redux-promise

function liftState(child, promises = []) {
  return {
    child,
    promises
  };
}

function unliftState({ child }) {
  return child;
}

function getState({ promises }) {
  return promises;
}

function liftReducer(reducer) {

  const unlifted = unliftReducer(reducer, {
    unliftState,
    unliftAction
  });

  return (state, action) => {
    switch(action.type) {
    case 'PROMISE_DISPATCH':
      return liftState(
        unliftState(state),
        [ ...getState(state), action.payload ]
      );
    case 'PROMISE_ERROR':
    case 'PROMISE_RESULT':
    case 'CHILD':
      return liftState(
        unlifted(state, action),
        getState(state)
      );
    default:
      return state;
    }
  }
}

function liftDispatch(dispatch) {
  return (action) => {
    if (isFSA(action)) {
      if (isPromise(action.payload)) {
        dispatch({ type: 'PROMISE_DISPATCH', payload: action });
        return action.payload.then(payload => {
          dispatch(liftAction('PROMISE_RESULT', {
            type: action.type,
            meta: action.meta,
            payload: payload,
          }));
        }, payload => {
          dispatch(liftAction('PROMISE_ERROR', {
            type: action.type,
            meta: action.meta,
            payload: payload,
            error: true,
          }));
        });
      }
    }
    return dispatch(liftAction('PASS', action));
  }
}

export default lift({
  liftReducer,
  liftDispatch,
  liftState,
  unliftState
});
