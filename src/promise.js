
import {
  liftState,
  unliftState,
  liftAction,
  unliftAction,
  unliftStore,
} from './lift';
import isPromise from 'is-promise';

function liftReducer(reducer) {
  return (state, action) => {
    const [child, promises] = unliftState(state);
    switch(action.type) {
    case 'PROMISE_DISPATCH':
      return liftState(child, [ ...promises, action.action.payload ]);
    case 'PROMISE_ERROR':
    case 'PROMISE_RESULT':
      return liftState(reducer(child, {
        type: action.action.type,
        payload: action.payload,
        error: action.error,
      }), promises);
    case 'CHILD':
      return liftState(reducer(unliftAction(action)), promises);
    default:
      return state;
    }
  }
}

function liftInitialState(initialState) {
  return liftState(initialState, []);
}


export function liftStore(store) {
  return {
    ...store,
    parent: {
      ...unliftStore(store),
      dispatch(action) {
        if (isPromise(action.payload)) {
          store.dispatch({ type: 'PROMISE_DISPATCH', action });
          return action.payload.then(payload => {
            store.dispatch({ type: 'PROMISE_RESULT', action, payload });
          }, payload => {
            store.dispatch({ type: 'PROMISE_ERROR', action, payload, error: true });
          });
        }
        return store.dispatch(liftAction('CHILD', action));
      }
    },
    replaceReducer(reducer) {
      return store.replaceReducer(liftReducer(reducer));
    }
  }
}

export default function (next : Function) : Function {
  return (reducer : Function, initialState : any) => liftStore(
    next(liftReducer(reducer), liftInitialState(initialState))
  );
}
