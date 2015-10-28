
import { compose } from 'redux';

type LiftArguments = {
  reducer: Function,
  initialState: Function,
  dispatch: Function
};

export const ActionTypes = {
  INIT: '@@redux/INIT',
  PROXY: '@@redux/PROXY'
};


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

/**
 * [dispatch description]
 * @param   {[type]} liftDispatch [description]
 * @returns {[type]}              [description]
 */
export function liftStore(store, liftedStore) {
  return {
    ...store,
    parent: store,
    root: store.root || store,
    dispatch(action) {
      store.dispatch({
        type: ActionTypes.PROXY,
        target: 1,
        action,
      })
    }
  };
}

function unliftStore(store) {
  return {
    ...store,
    getState() {
      return store.getState()[0];
    }
  };
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
