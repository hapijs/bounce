'use strict';

// Load modules


// Declare internals

const internals = {
    system: [
        EvalError,
        RangeError,
        ReferenceError,
        SyntaxError,
        TypeError,
        URIError
    ]
};


exports.catch = function (err, options = {}) {

    if (!internals.match(err, options)) {
        return;
    }

    // Error decorations

    if (options.decorate) {
        Object.assign(err, options.decorate);
    }

    throw err;
};


exports.decorate = function (err, properties) {

    Object.assign(err, properties);
    throw err;
};


exports.isBoom = function (err) {

    return exports.isError(err) && !!err.isBoom;
};


exports.isError = function (err) {

    return err instanceof Error;
};


exports.isSystem = function (err) {

    for (let i = 0; i < internals.system.length; ++i) {
        if (err instanceof internals.system[i]) {
            return true;
        }
    }

    return false;
};


internals.rules = {
    system: exports.isSystem,
    boom: exports.isBoom
};


internals.match = function (err, options) {

    if (!options.types) {
        return !options.not;
    }

    const types = Array.isArray(options.types) ? options.types : [options.types];
    for (let i = 0; i < types.length; ++i) {
        const type = types[i];
        if (internals.rules[type](err)) {
            return !options.not;
        }
    }

    return !!options.not;
};
