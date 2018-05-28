const xs = require('xstream');

function createStore(stateStreamCreators = {}, effectCreators = []) {
  let dispatch;

  const action$ = xs.create({
    start(listener) {
      dispatch = action => listener.next(action);
    },
    stop() {},
  });

  const select = a$ => actionName => {
    return actionName ? a$.filter(({type}) => type === actionName) : a$;
  };

  const reducer$ = xs.merge(
    ...Object.keys(stateStreamCreators).map(scope => {
      const streamCreator = stateStreamCreators[scope];
      const $ = streamCreator(select(action$));

      return $.map(stream => [scope, stream]);
    }),
  );

  const state$ = reducer$.fold((state, [scope, reducer]) => {
    return {
      ...state,
      [scope]: reducer(state[scope]),
    };
  }, {});

  xs
    .merge(action$, state$)
    .subscribe({next() {}})
    .unsubscribe();

  effectCreators.map(effect => effect(select(action$), dispatch));

  return {dispatch, state$};
}

module.exports = createStore;
