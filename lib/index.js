'use strict';

const Boom = require('@hapi/boom');
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


exports.ignore = function (err, types, options = {}) {

    return internals.catch(err, types, options, false);
};


internals.catch = function (err, types, options, match) {

    if (internals.match(err, types) !== match) {
        return;
    }

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


exports.isBoom = function (err) {

    return Boom.isBoom(err);
};


exports.isError = function (err) {

    return err instanceof Error;
};


exports.isSystem = function (err) {

    if (!err) {
        return false;
    }

    if (err.isBoom) {
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


internals.rules = {
    system: exports.isSystem,
    boom: exports.isBoom
};


internals.match = function (err, types) {

    if (!types) {
        return true;
    }

    types = Array.isArray(types) ? types : [types];
    for (const type of types) {
        if (typeof type === 'string') {
            if (internals.rules[type](err)) {
                return true;
            }
        }
        else if (typeof type === 'object') {
            if (Contain(err, type, { deep: true, part: true })) {
                return true;
            }
        }
        else if (err instanceof type) {
            return true;
        }
    }

    return false;
};
