import { createStore } from 'redux';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import lift from '../../src';
import layer from '../../src/layer';

chai.use(sinonChai);

describe('layer', () => {
  it('should do something', () => {

    // Simple reducer.
    function reducer(state, { type, value }) {
      return type === 'UPDATE' ? state + value : state;
    }

    const options = {
      reducer() {
        return (state, { type, payload }) => {
          switch(type) {
          case 'MESSAGE':
            return { message: payload };
          default:
            return state;
          }
        }
      },

      initialState() {
        return { message: 'hello' };
      },

      dispatch(ignore, dispatch) {
        return (action) => {
          if (action.type === 'UPCALL') {
            return dispatch({ type: 'MESSAGE', payload: action.payload });
          } else {
            return ignore(action);
          }
        }
      }
    };

    // Create the store.
    const store = lift(
      layer(options)
    )(createStore)(reducer, 1);

    store.dispatch({ type: 'UPDATE', value: 5 });
    store.dispatch({ type: 'UPCALL', payload: 'world' });

    const state = store.getState();

    expect(state).to.have.property(0, 6);
    expect(state).to.have.property(1).to.deep.equal({
      message: 'world'
    });
  });
});
