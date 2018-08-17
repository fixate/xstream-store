import {Stream} from 'xstream';

export type ActionType = string;
export type ScopeName = string;

export interface Action {
  type: ActionType;
  [key: string]: any;
}
export type ActionStream = Stream<Action>;

export interface ScopedState {
  [key: string]: any;
}

export type Dispatch = (a: Action) => void;
export type ActionStreamSelector = (actionType?: ActionType) => ActionStream;
export type StreamCreator<T = any> = (a$s: ActionStreamSelector) => Stream<T>;
export type EffectCreator = (a$s: ActionStreamSelector, d: Dispatch) => void;

export type ActionStreamSelectorCreator = (a$: ActionStream) => ActionStreamSelector;

export interface StreamCreatorMap {
  [key: string]: StreamCreator;
}

export interface Store<S> {
  dispatch: Dispatch;
  state$: Stream<S>;
  initialState: S;
}

export type CreateStore<S = {}> = (
  stateStreamCreators: StreamCreatorMap,
  effectCreators?: EffectCreator[],
) => Store<S>;
