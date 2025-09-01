'use strict';

const Contain = require('@hapi/hoek/contain');

const Assertions = require('./assertions');


const internals = {
    symbol: Symbol('SystemError'),
    system: [

        // JavaScript

        EvalError,
        RangeError,
        ReferenceError,
        SyntaxError,
        TypeError,
        URIError,

        ...Assertions
    ]
};


internals.slow = (() => {

    // Add hidden property to prototype that all instances will have

    const slow = [];
    const defaultHasInstance = Object[Symbol.hasInstance];
    for (const system of internals.system) {
        if (system[Symbol.hasInstance] !== defaultHasInstance) {      // Skip classes that use custom instanceof checks
            slow.push(system);
            continue;
        }

        Object.defineProperty(system.prototype, internals.symbol, {
            configurable: false,
            enumerable: false,
            writable: false,
            value: true
        });
    }

    return slow;
})();


exports.rethrow = function (err, types, options = {}) {

    return internals.catch(err, types, options, true);
};


exports.assert = function (err, types, options = {}) {

    return internals.catch(err, types, options, false);
};


internals.catch = function (err, types, options, match) {

    if (!types) {
        throw new TypeError('Missing or invalid "types" argument');
    }

    if (options.signal?.aborted) {
        throw options.signal.reason ?? new DOMException('This operation was aborted', 'AbortError');
    }

    const isErrorType = err instanceof Error;
    if (!isErrorType) {
        if (options.strict !== false) {
            throw new TypeError('Argument is not an Error', { cause: err });
        }

        return match ? undefined : internals.matched(err, options);
    }

    if (internals.match(err, types) !== match) {
        return;
    }

    return internals.matched(err, options);
};


internals.matched = function (err, options) {

    // Error replacement

    if (options.override) {
        err = options.override;
    }

    // Error decorations

    if (options.decorate) {
        Object.assign(err, options.decorate);
    }

    if (options.return) {
        return err;
    }

    throw err;
};


exports.background = async function (operation, action = 'rethrow', types = 'system', options = {}) {

    try {
        if (typeof operation === 'function') {
            await operation();
        }
        else {
            await operation;
        }
    }
    catch (err) {
        return exports[action](err, types, options);
    }
};


exports.isSystem = function (err) {

    if (!(err instanceof Error)) {
        return false;
    }

    return internals.isSystemError(err);
};


internals.isSystemError = function (err) {

    // 'err' is always instanceof Error

    if (err.isBoom) {                      // Boom errors can be instanceof system errors
        return false;
    }

    if (err[internals.symbol] === true) {
        return true;
    }

    for (const system of internals.slow) {
        if (err instanceof system) {
            return true;
        }
    }

    return false;
};


internals.isAbortError = function (err) {

    return err.name === 'AbortError';
};


exports.isAbort = function (err) {

    return err instanceof Error && internals.isAbortError(err);
};


internals.isTimeoutError = function (err) {

    return err.name === 'TimeoutError';
};


exports.isTimeout = function (err) {

    return err instanceof Error && err.name === 'TimeoutError';
};


internals.rules = {
    system: internals.isSystemError,
    abort: internals.isAbortError,
    timeout: internals.isTimeoutError
};


internals.match = function (err, types) {

    if (!Array.isArray(types)) {
        return internals._match(err, types);
    }

    for (const type of types) {
        if (internals._match(err, type)) {
            return true;
        }
    }

    return false;
};


internals._match = function (err, type) {

    try {
        switch (typeof type) {
            case 'string':
                return internals.rules[type](err);

            case 'object':
                return Contain(err, type, { deep: true, part: true });

            case 'function':
                return err instanceof type;
        }
    }
    catch (err) {
        var error = err;
    }

    throw new TypeError('Invalid "types" argument', error ? { reason: error } : undefined);
};
