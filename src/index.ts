import xs, {Stream} from 'xstream';

export interface IAction {
  type: string;
  [key: string]: any;
}

export type IDispatch = (action: IAction) => void;
export type IStreamCreator = (IStreamSelector) => Stream<any>;
export type IStreamSelector = (actionName: string) => Stream<IAction>;
export type IStreamSelect = (actionStream: Stream<IAction>) => IStreamSelector;
export type IEffectCreator = (actionStream: IStreamSelector, fn: IDispatch) => void;

export interface IStreamCreatorMap {
  [key: string]: IStreamCreator;
}

export type CreateStore = (
  stateStreamCreators: object,
  effectCreators: IEffectCreator[],
) => {
  dispatch: IDispatch;
  state$: Stream<object>;
};

const select: IStreamSelect = action$ => actionName =>
  actionName ? action$.filter(({type}) => type === actionName) : action$;

const createStore: CreateStore = (
  stateStreamCreators: IStreamCreatorMap = {},
  effectCreators = [],
) => {
  let dispatch: IDispatch;

  const action$: Stream<IAction> = xs.create({
    start(listener) {
      dispatch = action => listener.next(action);
    },
    // tslint:disable-next-line: no-empty
    stop() {},
  });

  const reducers$ = xs.merge(
    ...Object.keys(stateStreamCreators).map((scope: string) => {
      const streamCreator: IStreamCreator = stateStreamCreators[scope];
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
    // tslint:disable-next-line: no-empty
    .subscribe({next() {}, error() {}, complete() {}})
    .unsubscribe();

  effectCreators.map(effectCreator => {
    const action$Selector: IStreamSelector = select(action$);

    effectCreator(action$Selector, dispatch);
  });

  return {dispatch, state$};
};

export default createStore;
