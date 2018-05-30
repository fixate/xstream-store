import xs, {Stream} from 'xstream';

export interface Action {
  type: string;
}

export interface Dispatch {
  (action: Action): void;
}

export interface StreamSelector {
  (actionName: string): Stream<Action>;
}

export interface EffectCreator {
  (actionStream: StreamSelector, fn: Dispatch): void;
}

const select = (action$: Stream<Action>) => {
  return (actionName: string): Stream<Action> =>
    actionName ? action$.filter(({type}) => type === actionName) : action$;
};

const createStore = (stateStreamCreators: object = {}, effectCreators: EffectCreator[] = []) => {
  let dispatch: Dispatch;

  const action$: Stream<Action> = xs.create({
    start(listener) {
      dispatch = action => listener.next(action);
    },
    stop() {},
  });

  const reducers$ = xs.merge(
    ...Object.keys(stateStreamCreators).map((scope: string) => {
      const streamCreator = stateStreamCreators[scope];
      const reducer$ = streamCreator(select(action$));

      return reducer$.map(reducer => [scope, reducer]);
    }),
  );

  const state$: Stream<object> = reducers$.fold((state, [scope, reducer]) => {
    return {
      ...state,
      [scope]: reducer(state[scope]),
    };
  }, {});

  xs.merge(action$, state$)
    .subscribe({next() {}, error() {}, complete() {}})
    .unsubscribe();

  effectCreators.map(effect => effect(select(action$), dispatch));

  return {dispatch, state$};
};

export default createStore;
