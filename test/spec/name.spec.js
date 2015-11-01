require('source-map-support').install();

import { createStore, compose } from 'redux';
import promiseMiddleware from 'redux-promise';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import {
  liftAction,
  unliftAction,
  liftStore,
  lift,
  name,
  normalize
} from '../../src';

chai.use(sinonChai);

// Simple reducer.
function app(state, { type, value }) {
  return type === 'UPDATE' ? state + value : state;
}

function liftState(a, b = { message: 'hello' }) {
  return [a,b]
}

function unliftState([a,b]) {
  return a;
}

function liftReducer(reducer) {
  return (state, action) => {
    const [a,b] = state;
    switch(action.type) {
    case 'CHILD':
      return liftState(
        reducer(unliftState(state),
        unliftAction(action)
      ), state[1]);
    case 'MESSAGE':
      return liftState(unliftState(state), { message: action.payload });
    default:
      return state;
    }
  }
}

function liftDispatch(dispatch) {
  return (action) => dispatch(liftAction('CHILD', action));
}

const enhancer = lift({
  liftState,
  unliftState,
  liftReducer,
  liftDispatch
})

describe('name', () => {

  describe('named store', () => {
    it('should have a name property', () => {
      const liftedCreateStore = name('enhanced')(enhancer)(createStore);
      const store = liftedCreateStore(app, 1);
      expect(store.name).to.equal('enhanced');
    });

    it('should affect parent store', () => {
      const liftedCreateStore = compose(
        name('enhanced1')(enhancer),
        name('enhanced2')(enhancer)
      )(createStore);

      const store = liftedCreateStore(app, 1);
      expect(store.parent.name).to.equal('enhanced2');
    });
  });

  describe('normalize', () => {
    it('should create a map of named stores', () => {
      const liftedCreateStore = compose(
        name('enhanced1')(enhancer),
        name('enhanced2')(enhancer)
      )(createStore);

      const stores = normalize(liftedCreateStore(app, 1));
      expect(stores).to.have.keys('enhanced1', 'enhanced2', 'default');
    });


    it('should preserve the store hierarchy', () => {
      const liftedCreateStore = compose(
        name('enhanced1')(enhancer),
        name('enhanced2')(enhancer),
        name('enhanced3')(enhancer)
      )(createStore);

      const store = liftedCreateStore(app, 1);
      const stores = normalize(store);

      expect(stores.enhanced1).to.equal(store);
      expect(stores.enhanced2).to.equal(store.parent);
      expect(stores.enhanced3).to.equal(store.parent.parent);
      expect(stores.default).to.equal(store.parent.parent.parent);
    });

  });

});
