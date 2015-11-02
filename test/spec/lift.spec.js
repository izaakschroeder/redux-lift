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

describe('lift', () => {
  it('should return a store-creator function', () => {
    const creator = lift()(createStore);
    expect(creator).to.be.a.function;
    expect(creator(() => {})).to.have.property('dispatch');
  });

  it('should behave like the identity lift', () => {
    const creator = lift()(createStore);
    const store = creator(app, 1);
    expect(store.getState()).to.equal(1);
    store.dispatch({ type: 'UPDATE', value: 5 });
    expect(store.getState()).to.equal(6);
  });

  it.skip('should be able to replace native `applyMiddleware`', () => {
    // `applyMiddleware` is really just lifting the dispatch function, nothing
    // more. Everything else is the identity lift. This is here in the hopes
    // based Dan will incorporate `redux-lift` or spin off `applyMiddleware`.
    function applyMiddleware(...middlewares) {
      return lift({
        liftDispatch(dispatch) {
          const middlewareAPI = { dispatch };
          return compose(
            ...middlewares.map(middleware => middleware(middlewareAPI))
          )(dispatch);
        }
      });
    }
    const creator = applyMiddleware(promiseMiddleware)(createStore);
    const store = creator(app, 1).parent;
    return store.dispatch(Promise.resolve(5)).then(() => {
      expect(store.getState()).to.equal(6);
    });
  });


  describe('parent stores', () => {
    it('should exist', () => {
      const liftedCreateStore = compose(enhancer)(createStore);
      const store = liftedCreateStore(app, 1);
      expect(store).to.have.property('parent');
    });

    it('should return parent state', () => {
      const liftedCreateStore = compose(enhancer)(createStore);
      const store = liftedCreateStore(app, 6);
      expect(store.parent.getState()).to.equal(6);
    });

    it('should dispatch correctly', () => {
      const liftedCreateStore = compose(enhancer)(createStore);
      const store = liftedCreateStore(app, 1);
      store.parent.dispatch({ type: 'UPDATE', value: 5 });
      expect(store.getState()).to.have.property(0, 6);
    });
  });


  it('should do something', () => {

    const liftedCreateStore = compose(enhancer)(createStore);
    const store = liftedCreateStore(app, 1);

    store.parent.dispatch({ type: 'UPDATE', value: 5 });
    store.dispatch({ type: 'MESSAGE', payload: 'world' });

    const state = store.getState();

    expect(state).to.have.property(0, 6);
    expect(state).to.have.property(1).to.deep.equal({
      message: 'world'
    });

    expect(store.parent.getState()).to.equal(6);
  });
});
