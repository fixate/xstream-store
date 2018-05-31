import xs from 'xstream';
import createStore, {Action, StreamCreator} from '../src/index';

const counterActions = {
  add: <Action>{type: 'add'},
};

const counter$Creator: StreamCreator = select =>
  select(counterActions.add)
    .map(a => state => ({...state, value: state.value + 1}))
    .startWith(() => ({value: 0}));

const streamCreators = {
  counter: counter$Creator,
};

const effectCreators = [];

const store = createStore(streamCreators, effectCreators);

describe('store', () => {
  test('-> state stream receives broadcast events', () => {
    const {dispatch, state$} = store;

    state$.addListener({
      next(state) {
        expect(state).toBeTruthy();
      },
    });

    dispatch(counterActions.add);
  });

  test.skip('-> state stream is updated after reacting to broadcast event', () => {});

  test.skip('-> action stream receives broadcast events', () => {});

  test.skip('-> side effects receive broadcast events', () => {});
});
