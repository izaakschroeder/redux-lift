require('source-map-support').install();

import { createStore, compose } from 'redux';
import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import {
  liftStore,
  liftState,
  liftAction,
  unliftAction,
  unliftState
} from '../../src/lift';

chai.use(sinonChai);

describe('lift', () => {
  it('should return a store-creator function', () => {

  });

  it('should allow parents to forward reduces to children', () => {

  });

  it('should expose parent stores', () => {
    // store.unlift();
  });

  it('should expose the root store', () => {

  });

  it('should do something', () => {

    // Simple reducer.
    function app(state, { type, value }) {
      return type === 'UPDATE' ? state + value : state;
    }

    function reducerX(reducer) {
      return (state, action) => {
        const [a,b] = unliftState(state);
        switch(action.type) {
        case 'CHILD':
          return liftState(reducer(a, unliftAction(action)), b);
        case 'MESSAGE':
          return liftState(a, { message: action.payload });
        default:
          return state;
        }
      }
    }

    function initialStateX(initialState) {
      return liftState(initialState, { message: 'hello' });
    }

    function storeX(store) {
      return {
        ...store,
        dispatch(action) {
          if (action.type === 'UPCALL') {
            return store.dispatch({
              type: 'MESSAGE',
              payload: action.payload
            });
          }
          return store.dispatch(liftAction('CHILD', action));
        }
      }
    }

    function enhancer(next : Function) : Function {
      return (reducer : Function, initialState : any) => {
        const store = next(
          reducerX(reducer),
          initialStateX(initialState)
        );
        return storeX(store);
      }
    }

    // Create the store.
    const liftedCreateStore = compose(
      enhancer
    )(createStore);

    const store = liftedCreateStore(app, 1);



    store.dispatch({ type: 'UPDATE', value: 5 });
    store.dispatch({ type: 'UPCALL', payload: 'world' });


    const state = store.getState();

    expect(state).to.have.property(0, 6);
    expect(state).to.have.property(1).to.deep.equal({
      message: 'world'
    });
  });
});
