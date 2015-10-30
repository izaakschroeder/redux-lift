
/**
 * Simply identity function.
 * @param {any} x Input.
 * @returns {any} Returns whatever the input was.
 */
function identity<T>(x: T): T {
  return x;
}

/**
 * Take an action from the store you're lifting in order to proxy it.
 * @param   {[type]} type   [description]
 * @param   {[type]} action [description]
 * @returns {[type]}        [description]
 */
export function liftAction(type, action) {
  return {
    type: type,
    payload: action,
    meta: {
      lift: true
    }
  };
}

/**
 * Return the original action from one you've lifted.
 * @param   {[type]} { payload       } [description]
 * @returns {[type]}   [description]
 */
export function unliftAction({ payload }) {
  return payload;
}

/**
 * Re-create the original store from a lifted one. The unlifted store naturally
 * has to unlift the lifted state, so the `getState` method is overridden.
 * The `replaceReducer` is also overridden, since mutating derived state
 * (which is essentially what an unlifted store is) is undefined.
 * @param   {[type]} store [description]
 * @param   {[type]} {     unliftState   } [description]
 * @returns {[type]}       [description]
 */
export function unliftStore(store, { unliftState, liftDispatch }) {
  return {
    // Inherit normal store properties.
    ...store,
    // Raise it.
    dispatch: liftDispatch(store.dispatch),
    // Guard against silliness.
    replaceReducer() {
      throw new TypeError('Cannot mutate inner store.');
    },
    // Unwrap lifted state.
    getState() {
      return unliftState(store.getState());
    }
  }
}

/**
 * Lift a store, providing a new reducer and dispatcher. The original store and
 * compatible methods are available on the lifted store's `parent` property.
 * @param   {[type]} store   [description]
 * @param   {[type]} options [description]
 * @returns {[type]}         [description]
 */
export function liftStore(store, { liftReducer, liftDispatch, unliftState }) {
  return {
    ...store,
    parent: unliftStore(store, { unliftState, liftDispatch }),
    replaceReducer(reducer) {
      return store.replaceReducer(liftReducer(reducer));
    }
  }
}

export function unliftReducer(reducer, {
  unliftState,
  unliftAction,
}) {
  return (state, action) => reducer(unliftState(state), unliftAction(action));
}

/**
 * Create a store enhancer that lifts a store. This store enhancer works just
 * as any normal store enhancer, with the noteworthy point that the resulting
 * store is the _lifted_ store – it may or may not behave like its parent. You
 * can still access the parent and its normal behavior via the `parent` property
 * however.
 * @param {Object} options Select which parts of the store to lift.
 * @returns {Function} Store enhancer capable of performing the lift.
 */
export function lift({
  liftState = identity,
  unliftState = identity,
  liftReducer = identity,
  liftDispatch = identity,
} = { }) : Function {
  return (next : Function) : Function => {
    return (reducer : Function, initialState : any) => liftStore(
      next(liftReducer(reducer), liftState(initialState)),
      { liftState, unliftState, liftReducer, liftDispatch }
    );
  }
}
