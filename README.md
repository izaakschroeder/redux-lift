# redux-lift

Store composition for [redux].

![build status](http://img.shields.io/travis/izaakschroeder/redux-lift/master.svg?style=flat)
![coverage](http://img.shields.io/coveralls/izaakschroeder/redux-lift/master.svg?style=flat)
![license](http://img.shields.io/npm/l/redux-lift.svg?style=flat)
![version](http://img.shields.io/npm/v/redux-lift.svg?style=flat)
![downloads](http://img.shields.io/npm/dm/redux-lift.svg?style=flat)

The current primary composition mechanism in [redux] is [middleware]. While useful in altering the behavior of the `dispatch` function, it offers little control for composing multiple parts of an application that have different action or store needs. This is where [lifting] is useful.

Lifting allows you to "lift" your state, reducers and actions into another context. Lifting is a kind of [store enhancer] that is a superset of [middleware].

```javascript

```

Lifted actions bubble up, where as lifted reducers bubble down.

```

```

Note that because this is a store enhancer, this means some important changes to the way you pass the store to your redux components; the top-level store may not actually represent your application state anymore – it represents the composed state.

```javascript
import { createStore: baseCreateStore } from 'redux';
import lift from 'redux-lift';

// No more `applyMiddleware` – only store composition.
const createStore = lift(reducer, a, b, ..., n)(baseCreateStore);

// This store now represents the top lifted store (n). Calling `getState()` on
// it will result in the nth lifted state, which is not necessarily the state of
// your application.
const topStore = createStore(initialState);

// You want to pass the root store to your app.
const store = topStore.base;

const app = <Container store={store}><App/></Container>;
```

Creating lifts means creating functions that alter the flow of data.

```javascript
lift({
  // Unwrap data to send to the lower level reducer.
  reducer() {
    return (reducer) => (state, action) => reducer(state, action);
  },
  // Wrap data from the lower level dispatcher.
  dispatch() {
    return (dispatch) => (action) => dispatch(action);
  },
  // Wrap the lower level initial state.
  initialState() {
    return (initialState) => initialState;
  }
});
```

## Examples

### Redux Middleware

Since the `applyMiddleware` function is a store enhancer, it can be implemented trivially as a lift. The only thing middleware alters is the dispatch function, so the identity lift can be used for everything but the dispatch.

```javascript
function applyMiddleware(middleware) {
  // It's easy to see that this offers basically the same API as normal redux
  // middleware.
  return {
    ...identity(),
    dispatch: middleware
  };
}

const createStore = lift(
  reducer,
  applyMiddleware(promise)
)(baseCreateStore);
```

### Logging

The `tap` lift is identical to the `identity` lift with the difference that you can intercept the result as it passes through. This makes inspection straight-forward.

```javascript
function logger() {
  return tap({
    reducer(state, action) {
      console.log('reduce:', state, action);
    },
    dispatch(action) {
      console.log('dispatch:', action);
    }
  });
}

const createStore = lift(
  reducer,
  logger
)(baseCreateStore);

```

### Promises

The layer lift is the most complex but the most useful: it's possible to build whole new states that exist around other ones. The promise layer, for example, keeps track of promises that have been dispatched. It works very similarly to promise middleware, except that promise-related things are kept as part of state instead of being stuck in a closure somewhere.

```javascript
function promises() {
  return layer({
    reducer() {

    }
  })
}
```

Note the difference between:

```javascript

const store = lift(
  promises,
  devTools()
)(createStore)(reducer, initialState);


const store = compose(
  lift(promises)
  lift(devTools())
)(createStore)(reducer, initialState);
```

[redux]: https://github.com/gaearon/redux
[middleware]: http://rackt.org/redux/docs/advanced/Middleware
[lifting]: http://stackoverflow.com/questions/2395697
[store enhancer]: https://github.com/rackt/redux/blob/master/docs/Glossary.md#store-enhancer
