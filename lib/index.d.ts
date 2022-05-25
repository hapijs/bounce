import type { Boom } from "@hapi/boom";
import type { AssertionError } from "assert";

export type BounceErrorType = Error | "system" | "boom" | Record<any, any>;

export interface BounceOptions {
  /**
   * An object which is assigned to the `err`, copying the properties onto the error.
   */
  decorate?: Record<any, any>;

  /**
   * An error used to override `err` when `err` matches. If used with `decorate`, the `override` object is modified.
   */
  override?: Error;

  /**
   * If `true`, the error is returned instead of thrown. Defaults to `false`.
   * @defaultValue `false`
   */
  return?: boolean;
}

/**
 * A single item or an array of items of:
 *   - An error constructor (e.g. `SyntaxError`).
 *   - `'system'` - matches any languange native error or node assertions.
 *   - `'boom'` - matches [**boom**](https://github.com/hapijs/boom) errors.
 *   - an object where each property is compared with the error and must match the error property
 *       value. All the properties in the object must match the error but do not need to include all
 *       the error properties.
 */
export type BounceErrorTypes = BounceErrorType | BounceErrorType[];

export type BounceReturn<
  TErr extends Error,
  TOpts extends BounceOptions
> = TOpts extends { return: true }
  ? TOpts extends { decorate: any }
    ? (TOpts extends { override: any } ? TOpts["override"] : TErr) &
        TOpts["decorate"]
    : TOpts extends { override: any }
    ? TOpts["override"]
    : TErr
  : void;

/**
 * Throws the error passed if it matches any of the specified rules where:
 * - `err` - the error.
 *
 * @param err The error.
 * @param types {@link BounceErrorTypes}
 * @param options {@link BounceOptions}
 */
export function rethrow<TErr extends Error, TOpts extends BounceOptions>(
  err: TErr,
  types: BounceErrorTypes,
  options?: TOpts
): BounceReturn<TErr, TOpts>;

/**
 * The opposite action of {@link rethrow `rethrow()`}. Ignores any errors matching the specified `types`. Any error not matching is thrown after applying the `options`.
 *
 * @param err The error.
 * @param types same as the {@link BounceErrorTypes `types`} argument passed to `rethrow()`
 * @param options same as the {@link BounceOptions `options`} argument passed to `rethrow()`
 */
export function ignore<TErr extends Error, TOpts extends BounceOptions>(
  err: TErr,
  types: BounceErrorTypes,
  options?: TOpts
): BounceReturn<TErr, TOpts>;

/**
 * Awaits for the value to resolve in the background and then apply either the `rethrow()` or `ignore()` actions.
 *
 * @param operation a function, promise, or value that is `await`ed on inside a `try...catch` and any error thrown processed by the `action` rule.
 * @param action one of `'rethrow'` or `'ignore'`. Defaults to `'rethrow'`.
 * @param types same as the `types` argument passed to `rethrow()` or `ignore()`. Defaults to `'system'`.
 * @param options same as the {@link BounceOptions `options`} argument passed to `rethrow()` or `ignore()`.
 */
export function background(
  operation: Function | Promise<any> | any,
  action?: "rethrow" | "ignore",
  types?: BounceErrorTypes,
  options?: BounceOptions
): Promise<void>;

/**
 * Returns `true` when `err` is a [**boom**](https://github.com/hapijs/boom) error.
 *
 * @param err The error.
 */
export function isBoom(err: unknown): err is Boom;

/**
 * Returns `true` when `err` is an error.
 *
 * @param err The error.
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
 *
 * @param err The error.
 */
export function isSystem(
  err: unknown
): err is
  | EvalError
  | RangeError
  | ReferenceError
  | SyntaxError
  | TypeError
  | URIError
  | AssertionError;
