import xs, {Stream} from 'xstream';

import {
  Action,
  ActionStream,
  ActionStreamSelector,
  ActionStreamSelectorCreator,
  CreateStore,
  Dispatch,
  EffectCreator,
  ScopedState,
  ScopeName,
  StreamCreator,
  StreamCreatorMap,
} from './types';

const selectAction$ByType: ActionStreamSelectorCreator = action$ => actionType =>
  actionType ? action$.filter(({type}) => type === actionType) : action$;

const createStore: CreateStore = (
  streamCreatorMap: StreamCreatorMap = {},
  effectCreators: EffectCreator[] = [],
) => {
  let dispatch: Dispatch;
  let initialState: ScopedState;

  const action$: ActionStream = xs.create({
    start(listener) {
      dispatch = action => listener.next(action);
    },
    // tslint:disable-next-line: no-empty
    stop() {},
  });

  const reducers$ = xs.merge(
    ...Object.keys(streamCreatorMap).map((scopeName: ScopeName) => {
      const streamCreator: StreamCreator = streamCreatorMap[scopeName];
      const reducer$ = streamCreator(selectAction$ByType(action$));

      return reducer$.map(reducerOrInitialState => [scopeName, reducerOrInitialState]);
    }),
  );

  const state$: Stream<any> = reducers$.fold((state, [scopeName, reducerOrInitialState]) => {
    const scopedState =
      typeof reducerOrInitialState === 'function'
        ? reducerOrInitialState((state as ScopedState)[scopeName])
        : reducerOrInitialState;

    return {
      ...state,
      [scopeName]: scopedState,
    };
  }, {});

  xs.merge(action$, state$)
    .subscribe({
      next(state) {
        initialState = state;
      },
      error(e) {
        throw e;
      },
      // tslint:disable-next-line: no-empty
      complete() {},
    })
    .unsubscribe();

  effectCreators.map(effectCreator => {
    const action$Selector: ActionStreamSelector = selectAction$ByType(action$);

    effectCreator(action$Selector, dispatch);
  });

  return {dispatch, state$, initialState};
};

export default createStore;
