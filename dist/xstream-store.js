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
var select = function (action$) { return function (actionName) {
    return actionName ? action$.filter(function (_a) {
        var type = _a.type;
        return type === actionName;
    }) : action$;
}; };
var createStore = function (stateStreamCreators, effectCreators) {
    if (stateStreamCreators === void 0) { stateStreamCreators = {}; }
    if (effectCreators === void 0) { effectCreators = []; }
    var dispatch;
    var action$ = xstream_1.default.create({
        start: function (listener) {
            dispatch = function (action) { return listener.next(action); };
        },
        // tslint:disable-next-line: no-empty
        stop: function () { },
    });
    var reducers$ = xstream_1.default.merge.apply(xstream_1.default, Object.keys(stateStreamCreators).map(function (scope) {
        var streamCreator = stateStreamCreators[scope];
        var reducer$ = streamCreator(select(action$));
        return reducer$.map(function (reducer) { return [scope, reducer]; });
    }));
    var state$ = reducers$.fold(function (state, _a) {
        var scope = _a[0], reducer = _a[1];
        return __assign({}, state, (_b = {}, _b[scope] = reducer(state[scope]), _b));
        var _b;
    }, {});
    xstream_1.default.merge(action$, state$)
        // tslint:disable-next-line: no-empty
        .subscribe({ next: function () { }, error: function () { }, complete: function () { } })
        .unsubscribe();
    effectCreators.map(function (effectCreator) {
        var action$Selector = select(action$);
        effectCreator(action$Selector, dispatch);
    });
    return { dispatch: dispatch, state$: state$ };
};
exports.default = createStore;

},{"xstream":"xstream"}]},{},[1])(1)
});
