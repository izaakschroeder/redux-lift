
import { createStore } from 'redux';
import { expect } from 'chai';
import lift from '../../src';
import identity from '../../src/identity';

describe('identity', () => {
  it('should not alter anything', () => {
    // Simple reducer.
    function reducer(state, { type, value }) {
      return type === 'UPDATE' ? state + value : state;
    }

    // Create the store.
    const store = lift(
      identity()
    )(createStore)(reducer, 1);

    // Dispatch.
    store.dispatch({ type: 'UPDATE', value: 5 });

    // Check.
    expect(store.getState()).to.equal(6);
  });
})
