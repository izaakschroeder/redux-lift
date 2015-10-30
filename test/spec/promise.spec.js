
import promise from '../../src/promise';
import { createStore, compose } from 'redux';

import chai, { expect } from 'chai';

function app(state, { type, payload }) {
  return type === 'UPDATE' ? state + payload : state;
}

describe('promises', () => {
  it('should herp', () => {
    const store = compose(
      promise
    )(createStore)(app, 1);

    store.parent.dispatch({ type: 'UPDATE', payload: Promise.resolve(5) });
    return Promise.all(store.getState().promises).then(() => {
      expect(store.parent.getState()).to.equal(6);
    });
  });
});
