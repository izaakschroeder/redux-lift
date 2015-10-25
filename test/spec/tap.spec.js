
import { createStore } from 'redux';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import lift from '../../src';
import tap from '../../src/tap';

chai.use(sinonChai);

describe('tap', () => {
  let store;
  let sandbox;
  let options;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    options = {
      reducer: sandbox.stub(),
      dispatch: sandbox.stub(),
      initialState: sandbox.stub(),
    };

    // Simple reducer.
    function reducer(state, { type, value }) {
      return type === 'UPDATE' ? state + value : state;
    }

    // Create the store.
    store = lift(
      tap(options)
    )(createStore)(reducer, 1);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should not alter anything', () => {
    store.dispatch({ type: 'UPDATE', value: 5 });
    expect(store.getState()).to.equal(6);
  });

  it('should call `reducer` with correct values', () => {
    store.dispatch({ type: 'UPDATE', value: 5 });
    expect(options.reducer).to.be.calledTwice
      .and.calledWith(1, { type: '@@redux/INIT' })
      .and.calledWith(1, { type: 'UPDATE', value: 5 });
  });

  it('should call `initialState` with correct values', () => {
    expect(options.initialState).to.be.calledOnce
      .and.calledWith(1);
  });

  it('should call `dispatch` with correct values', () => {
    store.dispatch({ type: 'UPDATE', value: 5 });
    expect(options.dispatch).to.be.calledOnce
      .and.calledWith({ type: 'UPDATE', value: 5 });
  });
});
