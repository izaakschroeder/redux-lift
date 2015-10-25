

const promise = {
  reducer(pass) {
    return (state, action) => {
      const { promises } = state;
      console.log('PROMISE ACTION', state, action);
      switch(type) {
      case 'PROMISE_DISPATCH':
        return { promises: [ ...promises, action.action.payload ] };
      case 'PROMISE_ERROR':
      case 'PROMISE_RESULT':
        return pass(state, {
          ...action.action,
          payload: action.payload,
          error: action.error,
        });
      default:
        return state;
      }
    }
  },
  initialState() {
    return {
      promises: []
    };
  },
  dispatch(pass, dispatch) {
    return action => {
      if (isPromise(action.payload)) {
        dispatch({ type: 'PROMISE_DISPATCH', action });
        return action.payload.then(payload => {
          dispatch({ type: 'PROMISE_RESULT', action, payload });
        }, payload => {
          dispatch({ type: 'PROMISE_ERROR', action, payload, error: true });
        });
      } else {
        return pass(action);
      }
    }
  }
};
