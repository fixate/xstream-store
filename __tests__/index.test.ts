import xs from 'xstream';
import createStore, {IAction, IEffectCreator, IStreamCreatorMap} from '../src/index';
import buffer from 'xstream/extra/buffer';

// node --inspect-brk ts-node/register src/index.ts

const addAction = 'add';
const incrementAction = 'increment';

const counterActions = {
  [incrementAction]: <IAction>{type: 'increment'},
  [addAction]: (n: number): IAction => ({type: 'add', value: n}),
};

interface ICounterState {
  value: number;
}

const counterInitialState: ICounterState = {value: 0};

const counter$Creator = select =>
  xs
    .merge(
      select(incrementAction).map(_ => state => ({...state, value: state.value + 1})),
      select(addAction).map(action => state => ({
        ...state,
        value: state.value + action.value,
      })),
    )
    .startWith(counterInitialState);

const foo$Creator = select => xs.empty().startWith(() => {});

const streamCreators: IStreamCreatorMap = {
  counter: counter$Creator,
  foo: foo$Creator,
};

const getFreshStore = (streamCs = streamCreators, effectCs: IEffectCreator[] = []) =>
  createStore(streamCs, effectCs);

describe('store', () => {
  test('-> accepts no paramaeters', () => {
    const obj = {createStore};
    const spy = jest.spyOn(obj, 'createStore');
    const store = obj.createStore(undefined, undefined);

    expect(spy).not.toThrowError();
  });

  test('-> exports with initial state before any subscriptions', () => {
    const {initialState} = getFreshStore();

    expect(initialState).toHaveProperty('counter', counterInitialState);
  });

  test('-> state stream emits initial state', () => {
    const {state$} = getFreshStore();

    const sub = state$.subscribe({
      next(state) {
        expect(state).toHaveProperty('counter', counterInitialState);
        expect(state).toHaveProperty('foo');
      },
      error() {},
      complete() {},
    });

    state$.shamefullySendComplete();
    sub.unsubscribe();
  });

  test('-> dispatched actions emit events on state stream', () => {
    const {dispatch, state$} = getFreshStore();
    const dispatchCallsCount = 3;

    const sub = state$
      .map(({counter}: {counter: object}) => counter)
      .compose(buffer(xs.never()))
      .subscribe({
        next(values: {value: string}[]) {
          expect(values.length).toBe(dispatchCallsCount + 1);
          expect(values.slice(-1)[0].value).toBe(3);
        },
        error() {},
        complete() {},
      });

    Array.apply(null, Array(dispatchCallsCount)).map(() => dispatch(counterActions.increment));

    state$.shamefullySendComplete();

    sub.unsubscribe();
  });

  test('-> different dispatched actions produce correct state', () => {
    const {dispatch, state$} = getFreshStore();

    const sub = state$
      .map(({counter}: {counter: object}) => counter)
      .compose(buffer(xs.never()))
      .map(xs => xs.slice(-1)[0])
      .subscribe({
        next(latestState: ICounterState) {
          expect(latestState.value).toBe(11);
        },
        error() {},
        complete() {},
      });

    dispatch(counterActions.add(10));
    dispatch(counterActions.increment);

    state$.shamefullySendComplete();

    sub.unsubscribe();
  });

  test('-> side effects receive dispatched actions', () => {
    let action$;
    let subscription;
    const actionToDispatch = counterActions.add(1);
    const spy = jest.fn();
    const sideEffectCreator = select => {
      action$ = select();

      subscription = action$.compose(buffer(xs.never())).subscribe({
        next([action]) {
          spy();
          expect(action).toBe(actionToDispatch);

          action$.shamefullySendComplete();
        },
        complete() {
          expect(spy).toHaveBeenCalled();
        },
      });
    };
    const effectCreators = [sideEffectCreator];
    const {dispatch} = createStore(streamCreators, effectCreators);

    dispatch(actionToDispatch);
    action$.shamefullySendComplete();
  });

  test('-> side effects can dispatch actions', () => {
    const sideEffectCreator = (select, dispatch) => {
      const addAction$ = select(addAction);

      addAction$.subscribe({
        next() {
          dispatch(counterActions.increment);
        },
      });
    };
    const effectCreators = [sideEffectCreator];
    const {dispatch, state$} = createStore(streamCreators, effectCreators);

    state$
      .map(({counter}: {counter: object}) => counter)
      .compose(buffer(xs.never()))
      .addListener({
        next(states: ICounterState[]) {
          const lastState = states.slice(-1)[0];

          expect(lastState.value).toBe(11);
        },
      });

    dispatch(counterActions.add(10));
    state$.shamefullySendComplete();
  });
});
