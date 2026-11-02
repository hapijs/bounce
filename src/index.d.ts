/// <reference types="node" />

import type { AssertionError } from 'node:assert';
import type { Boom } from '@hapi/boom';
import type { AssertError } from '@hapi/hoek';

/**
 * A rule matched against an error:
 *
 * - An error constructor (e.g. `SyntaxError`).
 * - `'system'` - matches any language native error or node assertions.
 * - `'boom'` - matches [**boom**](https://github.com/hapijs/boom) errors.
 * - An object where each property is compared with the error and must match the error property value. All the properties
 *   in the object must match the error but do not need to include all the error properties.
 */
export type BounceErrorType = 'system' | 'boom' | (new (...args: any[]) => Error) | Record<any, any>;

/** A single {@link BounceErrorType} or an array of them. */
export type BounceErrorTypes = BounceErrorType | BounceErrorType[];

export interface BounceOptions {
    /** An object which is assigned to the `err`, copying the properties onto the error. */
    decorate?: Record<any, any>;

    /** An error used to override `err` when `err` matches. If used with `decorate`, the `override` object is modified. */
    override?: Error;

    /** If `true`, the error is returned instead of thrown. Defaults to `false`. */
    return?: boolean;
}

/** What a matched error resolves to; `undefined` under `return: true` when nothing was handled. */
export type BounceReturn<TErr, TOpts extends BounceOptions> = TOpts extends { return: true }
    ?
          | undefined
          | (TOpts extends { decorate: any }
                ? (TOpts extends { override: any } ? TOpts['override'] : TErr) & TOpts['decorate']
                : TOpts extends { override: any }
                  ? TOpts['override']
                  : TErr)
    : void;

/**
 * Throws the error passed if it matches any of the specified rules.
 *
 * @param err - The error.
 * @param types - The rules to match.
 * @param options - Replacement, decoration, and return behaviour.
 */
export function rethrow<TErr, TOpts extends BounceOptions>(
    err: TErr,
    types: BounceErrorTypes,
    options?: TOpts,
): BounceReturn<TErr, TOpts>;

/**
 * The opposite action of {@link rethrow}. Ignores any errors matching the specified `types`. Any error not matching is
 * thrown after applying the `options`.
 *
 * @param err - The error.
 * @param types - The rules to match.
 * @param options - Replacement, decoration, and return behaviour.
 */
export function ignore<TErr, TOpts extends BounceOptions>(
    err: TErr,
    types: BounceErrorTypes,
    options?: TOpts,
): BounceReturn<TErr, TOpts>;

/**
 * Awaits for the value to resolve in the background and then applies either the {@link rethrow} or {@link ignore} action.
 *
 * @param operation - A function, promise, or value that is `await`ed on inside a `try...catch`.
 * @param action - One of `'rethrow'` or `'ignore'`. Defaults to `'rethrow'`.
 * @param types - The rules to match. Defaults to `'system'`.
 * @param options - Replacement, decoration, and return behaviour.
 */
export function background<TOpts extends BounceOptions>(
    operation: unknown,
    action?: 'rethrow' | 'ignore',
    types?: BounceErrorTypes,
    options?: TOpts,
): Promise<BounceReturn<unknown, TOpts>>;

/**
 * Returns `true` when `err` is a [**boom**](https://github.com/hapijs/boom) error.
 *
 * @param err - The error.
 */
export function isBoom(err: unknown): err is Boom;

/**
 * Returns `true` when `err` is an error.
 *
 * @param err - The error.
 */
export function isError(err: unknown): err is Error;

/**
 * Returns `true` when `err` is a language native error, a node `AssertionError`, or a hoek `AssertError`.
 *
 * @param err - The error.
 */
export function isSystem(
    err: unknown,
): err is EvalError | RangeError | ReferenceError | SyntaxError | TypeError | URIError | AssertionError | AssertError;
