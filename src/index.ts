import xs, {Stream} from 'xstream';

export interface IAction {
  type: string;
  [key: string]: any;
}
export type IActionStream = Stream<IAction>;

export interface IScopedState {
  [key: string]: object;
}

export type IDispatch = (a: IAction) => void;
export type IActionStreamSelector = (actionType: string) => IActionStream;
export type IStreamCreator = (a$s: IActionStreamSelector) => Stream<any>;
export type IActionStreamSelectorCreator = (a$: IActionStream) => IActionStreamSelector;
export type IEffectCreator = (a$s: IActionStreamSelector, d: IDispatch) => void;

export interface IStreamCreatorMap {
  [key: string]: IStreamCreator;
}

export type CreateStore = (
  stateStreamCreators: IStreamCreatorMap,
  effectCreators: IEffectCreator[],
) => {
  dispatch: IDispatch;
  state$: Stream<object>;
};

const selectAction$ByType: IActionStreamSelectorCreator = action$ => actionType =>
  actionType ? action$.filter(({type}) => type === actionType) : action$;

const createStore: CreateStore = (stateStreamCreators = {}, effectCreators = []) => {
  let dispatch: IDispatch;

  const action$: IActionStream = xs.create({
    start(listener) {
      dispatch = action => listener.next(action);
    },
    // tslint:disable-next-line: no-empty
    stop() {},
  });

  const reducers$ = xs.merge(
    ...Object.keys(stateStreamCreators).map((scope: string) => {
      const streamCreator: IStreamCreator = stateStreamCreators[scope];
      const reducer$ = streamCreator(selectAction$ByType(action$));

      return reducer$.map(reducerOrInitialState => {
	return [scope, reducerOrInitialState];
      });
    }),
  );

  const state$: Stream<IScopedState> = reducers$.fold((state, [scope, reducerOrInitialState]) => {
    const scopedState =
      typeof reducerOrInitialState === 'function'
	? reducerOrInitialState((state as IScopedState)[scope])
	: reducerOrInitialState;

    return {
      ...state,
      [scope]: scopedState,
    };
  }, {});

  xs.merge(action$, state$)
    .subscribe({
      // tslint:disable-next-line: no-empty
      next() {},
      error(e) {
        throw e;
      },
      // tslint:disable-next-line: no-empty
      complete() {},
    })
    .unsubscribe();

  effectCreators.map(effectCreator => {
    const action$Selector: IActionStreamSelector = selectAction$ByType(action$);

    effectCreator(action$Selector, dispatch);
  });

  return {dispatch, state$};
};

export default createStore;
