const xs = require('xstream').default;

const ADD_TYPE = 'add';
const add = value => ({
  type: ADD_TYPE,
  value,
});

const INCREMENT_TYPE = 'increment';
const increment = () => ({
  type: INCREMENT_TYPE,
});

const initialState = {value: 0};

const counter$Creator = select =>
  xs
    .merge(
      select(INCREMENT_TYPE).map(_ => state => ({...state, value: state.value + 1})),
      select(ADD_TYPE).map(action => state => ({...state, value: state.value + action.value})),
    )
    .startWith(() => initialState);

const addLogEffect = select => {
  const addAction$ = select(ADD_TYPE);

  addAction$.addListener({
    next(action) {
      console.log(`added ${action.value}!`);
    },
  });
};

const incrementLogEffect = (select, dispatch) => {
  const incrementAction$ = select(INCREMENT_TYPE);

  incrementAction$.addListener({
    next(action) {
      console.log('incremented!');
      console.log('');
      console.log('Adding 10 via side effect in 2s', '...');

      setTimeout(() => {
        dispatch(add(10));
      }, 2000);
    },
  });
};

const counterEffectsCreator = (select, dispatch) => {
  [addLogEffect, incrementLogEffect].map(effect => effect(select, dispatch));
};

module.exports = {
  counterEffectsCreator,
  counter$Creator,
  add,
  increment,
  ADD_TYPE,
  INCREMENT_TYPE,
};
