import type { Boom } from "@hapi/boom";

/**
 * Possible type matching rule. One of:
 *  - An error constructor (e.g. `SyntaxError`).
 *  - `'system'` - matches any language native error or node assertions.
 *  - `'boom'` - matches [**boom**](https://github.com/hapijs/boom) errors.
 *  - `'abort'` - matches an `AbortError`, as generated on an `AbortSignal` by `AbortController.abort()`.
 *  - `'timeout'` - matches a `TimeoutError`, as generated by `AbortSignal.timeout(delay)`.
 *  - an object where each property is compared with the error and must match the error property
 *    value. All the properties in the object must match the error but do not need to include all
 *    the error properties.
 */
type TypeRule = 'system' | 'boom' | 'abort' | 'timeout' | ErrorConstructor | { [key: PropertyKey]: any };

type Decoration = { [key: string]: any };

interface BounceOptions {

    /**
     * An object which is assigned to the `err`, copying the properties onto the error.
     */
    decorate?: { [key: string]: any };

    /**
     * An error used to override `err` when `err` matches.
     * If used with `decorate`, the `override` object is modified.
     */
    override?: Error;

    /**
     * If `true`, the error is returned instead of thrown. Defaults to `false`.
     */
    return?: boolean;
}

/**
 * Throws the error passed if it matches any of the specified rules.
 *
 * @param err - the error object to test.
 * @param type - a single {@link TypeRule `TypeRule`} or an array of {@link TypeRule `TypeRule`}.
 * @param options - optional {@link BounceOptions settings}.
 * 
 * @returns possibly an `Error` depending on value of the `return` and `decorate` options.
 */
export function rethrow<E extends Error, D extends Decoration>(err: any, types: TypeRule | TypeRule[], options: BounceOptions & { return: true, decorate: D, override: E }): (E & D) | undefined;
export function rethrow<T extends object, D extends Decoration>(err: T, types: TypeRule | TypeRule[], options: BounceOptions & { return: true, decorate: D }): (T & D) | undefined;
export function rethrow<E extends Error>(err: any, types: TypeRule | TypeRule[], options: BounceOptions & { return: true, override: E }): E | undefined;
export function rethrow<T>(err: T, types: TypeRule | TypeRule[], options: BounceOptions & { return: true }): T | undefined;
export function rethrow(err: any, types: TypeRule | TypeRule[], options?: BounceOptions): void;

/**
 * The opposite action of {@link rethrow `rethrow()`}. Ignores any errors matching the specified `types`.
 * Any error not matching is thrown after applying the `options`.
 *
 * @param err - the error object to test.
 * @param type - a single {@link TypeRule `TypeRule`} or an array of {@link TypeRule `TypeRule`}.
 * @param options - optional {@link BounceOptions settings}.
 * 
 * @returns possibly an `Error` depending on value of the `return` and `decorate` options.
 */
export function ignore<E extends Error, D extends Decoration>(err: any, types: TypeRule | TypeRule[], options: BounceOptions & { return: true, decorate: D, override: E }): (E & D) | undefined;
export function ignore<T extends object, D extends Decoration>(err: T, types: TypeRule | TypeRule[], options: BounceOptions & { return: true, decorate: D }): (T & D) | undefined;
export function ignore<E extends Error>(err: any, types: TypeRule | TypeRule[], options: BounceOptions & { return: true, override: E }): E | undefined;
export function ignore<T>(err: T, types: TypeRule | TypeRule[], options: BounceOptions & { return: true }): T | undefined;
export function ignore(err: any, types: TypeRule | TypeRule[], options?: BounceOptions): void;

type Action = 'rethrow' | 'ignore';

/**
 * Awaits for the value to resolve in the background and then apply either the {@link rethrow `rethrow()`} or {@link rethrow `ignore()`} action.
 *
 * @param operation - a function, promise, or value that is `await`ed on inside a `try...catch`
 * and any error thrown processed by the `action` rule.
 * @param action - one of `'rethrow'` or`'ignore'`. Defaults to`'rethrow'`.
 * @param types - same as the `types` argument passed to {@link rethrow `rethrow()`} or {@link rethrow `ignore()`}. Defaults to `'system'`.
 * @param options - same as the {@link BounceOptions `options`} argument passed to {@link rethrow `rethrow()`} or {@link rethrow `ignore()`}.
 */
export function background<E extends Error, D extends Decoration>(operation: any, action?: Action, types?: TypeRule | TypeRule[], options?: BounceOptions & { return: true, override: E, decorate: D }): Promise<(E & D) | undefined>;
export function background<E extends Error>(operation: any, action?: Action, types?: TypeRule | TypeRule[], options?: BounceOptions & { return: true, override: E }): Promise<E | undefined>;
export function background(operation: any, action?: Action, types?: TypeRule | TypeRule[], options?: BounceOptions & { return: true }): Promise<any>;
export function background(operation: any, action?: Action, types?: TypeRule | TypeRule[], options?: BounceOptions): Promise<void>;

/**
 * Returns `true` when `err` is a [**boom**](https://github.com/hapijs/boom) error.
 *
 * @param err - Object to test.
 */
export function isBoom(err: unknown): err is Boom;

/**
 * Returns `true` when `err` is an error.
 *
 * @param err - Object to test.
 */
export function isError(err: unknown): err is Error;

/**
 * Return `true` when `err` is one of:
 * - `EvalError`
 * - `RangeError`
 * - `ReferenceError`
 * - `SyntaxError`
 * - `TypeError`
 * - `URIError`
 * - Node's `AssertionError`
 * - Hoek's `AssertError`
 *
 * @param err - Object to test.
 */
export function isSystem(err: unknown): err is Error;

/**
 * Returns `true` when `err` is an `AbortError`, as generated by `AbortSignal.abort()`.
 * 
 * Note that unlike other errors, `AbortError` cannot be considered a class in itself.
 * The best way to create a custom `AbortError` is with `new DOMException(message, 'AbortError')`.
 *
 * @param err - Object to test.
 */
export function isAbort(err: unknown): err is Error & { name: 'AbortError' };

/**
 * Returns `true` when `err` is a `TimeoutError`, as generated by `AbortSignal.timeout(delay)`.
 * 
 * Note that unlike other errors, `TimeoutError` cannot be considered a class in itself.
 * The best way to create a custom `TimeoutError` is with `new DOMException(message, 'TimeoutError')`.
 *
 * @param err - Object to test.
 */
export function isTimeout(err: unknown): err is Error & { name: 'TimeoutError' };
