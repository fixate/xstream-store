import xs from 'xstream';
import createStore, {Action, StreamCreators} from '../src/index';

const counterActions = {
  add: <Action>{type: 'add'},
};

const counterInitialState = {value: 0};

const counter$Creator = select =>
  select(counterActions.add.type)
    .map(a => state => {
      return {...state, value: state.value + 1};
    })
    .startWith(() => counterInitialState);

const streamCreators: StreamCreators = {
  counter: counter$Creator,
};

const effectCreators = [];

const store = createStore(streamCreators, effectCreators);

describe('store', () => {
  test('-> state stream receives broadcast events', () => {
    const {dispatch, state$} = store;

    state$.addListener({
      next(state: {counter: object}) {
        expect(state.counter).toBe(counterInitialState);
      },
    });

    // dispatch(counterActions.add);
  });

  test.skip('-> state stream is updated after reacting to broadcast event', () => {});

  test.skip('-> action stream receives broadcast events', () => {});

  test.skip('-> side effects receive broadcast events', () => {});
});
