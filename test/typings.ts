import * as Boom from '@hapi/boom';
import { describe, expectTypeOf, it } from 'vitest';

import * as Bounce from '../src/index.js';

class CustomError extends Error {
    custom = 'custom';
}

describe('typings', () => {
    describe('rethrow', () => {
        it('returns void unless asked to return', () => {
            expectTypeOf(Bounce.rethrow(new Error(), 'system')).toEqualTypeOf<void>();
            expectTypeOf(Bounce.rethrow(new Error(), 'system', { decorate: { x: 1 } })).toEqualTypeOf<void>();
        });

        it('resolves the returned error from the options', () => {
            expectTypeOf(Bounce.rethrow(new Error(), 'system', { return: true })).toEqualTypeOf<Error | undefined>();
            expectTypeOf(
                Bounce.rethrow(new Error(), 'system', { return: true, override: new CustomError() }),
            ).toEqualTypeOf<CustomError | undefined>();
            expectTypeOf(Bounce.rethrow(new Error(), 'system', { return: true, decorate: { x: 1 } })).toEqualTypeOf<
                (Error & { x: number }) | undefined
            >();
            expectTypeOf(
                Bounce.rethrow(new Error(), 'system', {
                    return: true,
                    override: new CustomError(),
                    decorate: { x: 1 },
                }),
            ).toEqualTypeOf<(CustomError & { x: number }) | undefined>();
        });
    });

    describe('ignore', () => {
        it('returns void unless asked to return', () => {
            expectTypeOf(Bounce.ignore(new TypeError(), 'system')).toEqualTypeOf<void>();
        });

        it('resolves the returned error from the options', () => {
            expectTypeOf(Bounce.ignore(new TypeError(), 'system', { return: true })).toEqualTypeOf<
                TypeError | undefined
            >();
        });
    });

    describe('types', () => {
        it('accepts every rule shape', () => {
            Bounce.rethrow(new Error(), 'system');
            Bounce.rethrow(new Error(), 'boom');
            Bounce.rethrow(new Error(), URIError);
            Bounce.rethrow(new Error(), { x: 1 });
            Bounce.rethrow(new Error(), ['system', 'boom', URIError, { x: 1 }]);
        });

        it('accepts the unknown a catch clause binds', () => {
            try {
                throw new Error();
            } catch (err) {
                Bounce.rethrow(err, 'system');
            }
        });

        it('invalid calls rejected', () => {
            try {
                // @ts-expect-error unknown rule name
                Bounce.rethrow(new Error(), 'systm');
            } catch {}

            // @ts-expect-error override must be an error
            Bounce.rethrow(new Error(), 'system', { override: {} });

            // @ts-expect-error return must be a boolean
            Bounce.rethrow(new Error(), 'system', { return: 1 });
        });
    });

    describe('background', () => {
        it('resolves to void unless asked to return', async () => {
            expectTypeOf(await Bounce.background(() => {})).toEqualTypeOf<void>();
            expectTypeOf(await Bounce.background(Promise.resolve(), 'ignore', 'boom')).toEqualTypeOf<void>();
        });

        it('resolves the returned error from the options', () => {
            expectTypeOf(
                Bounce.background(() => {}, 'rethrow', 'system', { return: true, override: new CustomError() }),
            ).resolves.toEqualTypeOf<CustomError | undefined>();
        });

        it('invalid calls rejected', () => {
            // @ts-expect-error action must be rethrow or ignore
            Bounce.background(Promise.resolve(), 'rethro');
        });
    });

    describe('guards', () => {
        it('narrows the error', () => {
            const err: unknown = Boom.badRequest();

            if (Bounce.isBoom(err)) {
                expectTypeOf(err).toEqualTypeOf<Boom.Boom>();
            }

            if (Bounce.isError(err)) {
                expectTypeOf(err).toEqualTypeOf<Error>();
            }

            if (Bounce.isSystem(err)) {
                expectTypeOf(err).toExtend<Error>();
            }
        });
    });
});
