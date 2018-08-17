(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.xstreamStore = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var xstream_1 = require("xstream");
var selectAction$ByType = function (action$) { return function (actionType) {
    return actionType ? action$.filter(function (_a) {
        var type = _a.type;
        return type === actionType;
    }) : action$;
}; };
var createStore = function (streamCreatorMap, effectCreators) {
    if (streamCreatorMap === void 0) { streamCreatorMap = {}; }
    if (effectCreators === void 0) { effectCreators = []; }
    var dispatch;
    var initialState;
    var action$ = xstream_1.default.create({
        start: function (listener) {
            dispatch = function (action) { return listener.next(action); };
        },
        // tslint:disable-next-line: no-empty
        stop: function () { },
    });
    var reducers$ = xstream_1.default.merge.apply(xstream_1.default, Object.keys(streamCreatorMap).map(function (scopeName) {
        var streamCreator = streamCreatorMap[scopeName];
        var reducer$ = streamCreator(selectAction$ByType(action$));
        return reducer$.map(function (reducerOrInitialState) { return [scopeName, reducerOrInitialState]; });
    }));
    var state$ = reducers$.fold(function (state, _a) {
        var scopeName = _a[0], reducerOrInitialState = _a[1];
        var scopedState = typeof reducerOrInitialState === 'function'
            ? reducerOrInitialState(state[scopeName])
            : reducerOrInitialState;
        return __assign({}, state, (_b = {}, _b[scopeName] = scopedState, _b));
        var _b;
    }, {});
    xstream_1.default.merge(action$, state$)
        .subscribe({
        next: function (state) {
            initialState = state;
        },
        error: function (e) {
            throw e;
        },
        // tslint:disable-next-line: no-empty
        complete: function () { },
    })
        .unsubscribe();
    effectCreators.map(function (effectCreator) {
        var action$Selector = selectAction$ByType(action$);
        effectCreator(action$Selector, dispatch);
    });
    return { dispatch: dispatch, state$: state$, initialState: initialState };
};
exports.default = createStore;

},{"xstream":"xstream"}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var create_store_1 = require("./create-store");
exports.default = create_store_1.default;

},{"./create-store":1}]},{},[2])(2)
});
