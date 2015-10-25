
import { compose } from 'redux';

type LiftArguments = {
  reducer: Function,
  initialState: Function,
  dispatch: Function
};


/**
 * [lift description]
 * @param reducer {Function} Create new reducer from an old one.
 * @param initialState {Function} Create new initial state from an old one.
 * @param dispatch {Function} Create new dispatch from an old one.
 * @returns {Function} Store enhancer.
 */
function _lift({
  reducer: liftReducer,
  initialState: liftInitialState,
  dispatch: liftDispatch
} : LiftArguments) : Function {
  return (next : Function) : Function =>
    (reducer : Function, initialState : any) => {
      const store = next(
        liftReducer(reducer),
        liftInitialState(initialState)
      );
      return {
        ...store,
        /* TODO: Make original store accessible */
        dispatch: liftDispatch(store.dispatch),
        replaceReducer(reducer) {
          store.replaceReducer(liftReducer(reducer));
        }
      };
    };
}

/**
 * This is simply the multi-argument version of `_lift` so that you can pass
 * many lifts to it instead of just one.
 * @returns {Function} Store enhancer.
 */
export default function lift(...lifts) : Function {
  return compose(...lifts.map(_lift));
}
