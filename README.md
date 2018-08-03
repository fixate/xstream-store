# xstream-store

[![Build Status](https://travis-ci.org/fixate/xstream-store.svg?branch=master)](https://travis-ci.org/fixate/xstream-store)
[![npm version](https://badge.fury.io/js/xstream-store.svg)](https://badge.fury.io/js/xstream-store)
[![codecov](https://codecov.io/gh/fixate/xstream-store/branch/master/graph/badge.svg)](https://codecov.io/gh/fixate/xstream-store)


A redux-like store module for xstream inspired by redux.

Take the pain out of handling side-effects with the power of observables. Eliminate
the need for use of middleware such as `redux-thunk`, and side-effect handlers such
as `redux-saga`.

## Install

```
$ npm i xstream-store xstream
```

## Example

View the source in `examples/`:

```bash
$ node examples/counter
```

## Usage

```javascript
// my-streamed-counter.js

const ADD_TYPE = 'add';
const addActionCreator = value => ({
  type: ADD_TYPE,
  value,
});

const RESET_TYPE = 'reset';
const resetAction = {
  type: RESET_TYPE,
};

const initialState = {value: 0};

const counter$Creator = select =>
  // our counter stream that only receives `counter` state
  xs
    .merge(
      select(ADD_TYPE).map(action => state => ({
        ...state,
        value: state.value + action.value,
      })),
      select(RESET).map(_ => _ => initialState)
    )
    // provide initialState in a callback
    .startWith(() => initialState);

const counterEffectsCreator = (select, dispatch) => {
  // a stream of all actions
  const action$ = select();
  // a stream of add actions
  const addAction$ = select(ADD_TYPE);
  // a stream of reset actions
  const reset$ = select(RESET_TYPE);

  action$.addListener({
    next(action) {
      console.log('I log on every action', action);
    }
  })

  add$.addListener({
    next(action) {
      console.log('I log every add action', action);

      // dispatch a reset when our counter's value is greater than 3
      if (action.value > 3) {
        dispatch(resetAction);
      }
    }
  })

  reset$.addListener({
    next() {
      console.log('Counter reset!');
    }
  })
};

export {
  addAction,
  counter$Creator,
  counterEffectsCreator,
}
```

```javascript
// store.js
import createStore from 'xstream-store';
import {
  addActionCreator,
  counterEffectsCreator,
  counterStreamCreators
} from './my-streamed-counter'

const add1Action = addActionCreator(1);

const streamCreatorMap = {
  counter: counterStreamCreator,
}

const effectCreators = [
  counterEffectsCreator,
  // fooEffectsCreator
];

const store = createStore(streamCreatorMap, effectCreators);

// subscribe to your state stream
store.state$.addListener({
  next(state) { console.log(`entire state: ${state}`) },
});

const counterState = store.state$
                      .map(({counter}) => counter)
                      .addListener({
                        next(counterState) {
                          console.log(`counter state: ${state}`)
                        }
                      });

// dispatch actions
store.dispatch(add1Action);
// entire state: {counter: { value: 1 }}
// counter state: { value: 1 }

store.dispatch(add1Action);
// entire state: {counter: { value: 2 }}
// counter state: { value: 2 }
```

### `state$`

### `dispatch`

### Actions

### Stream Creator

### Effects Creator

###

## Related Libraries

- [xstream-store-resource](https://github.com/fixate/xstream-store-resource) - easily generate streams for asynchronous requests
- [react-xstream-store](https://github.com/fixate/react-xstream-store) - connect React components to an xstream store

## Todo

- [ ] add usage

## License

MIT
