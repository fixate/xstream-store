const createStore = require('../../src/index').default;
const {counter$Creator, counterEffectsCreator, add, increment} = require('./state');

const streamCreators = {counter: counter$Creator};
const effectCreators = [counterEffectsCreator];

const store = createStore(streamCreators, effectCreators);

store.state$
  // get only the counter state
  .map(({counter}) => counter)
  .addListener({
    next(counterState) {
      console.log(counterState);
    },
  });

// add 1 to counter state
store.dispatch(add(1));

// then increment counter state
store.dispatch(increment());
