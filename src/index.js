import { AssertionError } from 'node:assert';

import * as Boom from '@hapi/boom';
import * as Hoek from '@hapi/hoek';

const system = [
    // JavaScript

    EvalError,
    RangeError,
    ReferenceError,
    SyntaxError,
    TypeError,
    URIError,

    // Node

    AssertionError,

    // Hoek

    Hoek.AssertError,
];

export function rethrow(err, types, options = {}) {
    return handle(err, types, options, true);
}

export function ignore(err, types, options = {}) {
    return handle(err, types, options, false);
}

function handle(err, types, options, shouldMatch) {
    if (match(err, types) !== shouldMatch) {
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
}

const actions = { rethrow, ignore };

export async function background(operation, action = 'rethrow', types = 'system', options = {}) {
    try {
        if (typeof operation === 'function') {
            await operation();
        } else {
            await operation;
        }
    } catch (err) {
        return actions[action](err, types, options);
    }
}

export function isBoom(err) {
    return Boom.isBoom(err);
}

export function isError(err) {
    return err instanceof Error;
}

export function isSystem(err) {
    if (!err) {
        return false;
    }

    if (err.isBoom) {
        return false;
    }

    for (const type of system) {
        if (err instanceof type) {
            return true;
        }
    }

    return false;
}

const rules = {
    system: isSystem,
    boom: isBoom,
};

function match(err, types) {
    if (!types) {
        return true;
    }

    types = Array.isArray(types) ? types : [types];
    for (const type of types) {
        if (typeof type === 'string') {
            if (rules[type](err)) {
                return true;
            }
        } else if (typeof type === 'object') {
            if (Hoek.contain(err, type, { deep: true, part: true })) {
                return true;
            }
        } else if (err instanceof type) {
            return true;
        }
    }

    return false;
}
