
export const ActionTypes = {
  INIT: '@@redux/INIT',
  PROXY: '@@redux/PROXY'
};


export default function layer({
  reducer: liftReducer,
  initialState: liftInitialState,
  dispatch: liftDispatch
}) {

  return {
    reducer(reducer) {
      const reducers = [
        reducer,
        liftReducer(reducer),
      ];

      return (state, action) => {
        switch(action.type) {

        // Map all original reducers with original state. The init action is
        // never wrapped since it is sent directly by the store.
        case ActionTypes.INIT:
          return reducers.map(
            (reducer, key) => reducer(state[key], action)
          );

        // Map the target reducer with the target state.
        case ActionTypes.PROXY:
          const target = action.target;
          return {
            ...state,
            [target]: reducers[target](state[target], action.action),
          };

        // Unreachable, but here for posterity.
        default:
          return state;
        }
      }
    },

    initialState(initialState) {
      return [
        initialState,
        liftInitialState(initialState),
      ];
    },

    dispatch(dispatch) {
      function proxy(target) {
        return action => dispatch({
          type: ActionTypes.PROXY,
          target,
          action,
        });
      }

      return liftDispatch(proxy(0), proxy(1));
    }
  }
}
