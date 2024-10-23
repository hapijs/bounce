import * as Bounce from '..';
import * as Boom from '@hapi/boom';
import * as Lab from '@hapi/lab';

const { expect } = Lab.types;

// rethrow()

expect.type<void>(Bounce.rethrow(new Error(), 'system'));
expect.type<void>(Bounce.rethrow(123, 'boom'));
expect.type<void>(Bounce.rethrow(new TypeError(), ['boom', RangeError, { prop: true }]));
expect.type<TypeError | undefined>(Bounce.rethrow(new TypeError(), 'boom', { return: true }));
expect.type<RangeError | undefined>(Bounce.rethrow(null, 'boom', { return: true, override: new RangeError() }));
expect.type<(TypeError & { prop: string }) | undefined>(Bounce.rethrow(new TypeError(), 'boom', { return: true, decorate: { prop: 'ok' } }));

expect.error(Bounce.rethrow(new Error()));
expect.error(Bounce.rethrow(new Error(), 'unknown'));
expect.error(Bounce.rethrow(new Error(), 'boom', true));
expect.error(Bounce.rethrow(new Error(), 'boom', { unknown: true }));
expect.error(Bounce.rethrow(new Error(), 'boom', { decorate: 123 }));
expect.error(Bounce.rethrow(new Error(), 'boom', { override: {} }));

// ignore()

expect.type<void>(Bounce.ignore(new TypeError(), 'system'));
expect.type<void>(Bounce.ignore(new Boom.Boom(), 'boom'));
expect.type<void>(Bounce.ignore(new RangeError(), ['boom', RangeError, { prop: true }]));
expect.type<TypeError | undefined>(Bounce.ignore(new TypeError(), 'boom', { return: true }));
expect.type<RangeError | undefined>(Bounce.ignore(null, 'boom', { return: true, override: new RangeError() }));
expect.type<(TypeError & { prop: string }) | undefined>(Bounce.ignore(new TypeError(), 'boom', { return: true, decorate: { prop: 'ok' } }));

expect.error(Bounce.ignore(new Error()));
expect.error(Bounce.ignore(new Error(), 'unknown'));
expect.error(Bounce.ignore(new Error(), 'boom', true));
expect.error(Bounce.ignore(new Error(), 'boom', { unknown: true }));
expect.error(Bounce.ignore(new Error(), 'boom', { decorate: 123 }));
expect.error(Bounce.ignore(new Error(), 'boom', { override: {} }));

// background()

expect.type<Promise<void>>(Bounce.background(async () => undefined, 'ignore', 'system', { decorate: { a: true } }));
expect.type<Promise<any>>(Bounce.background(async () => undefined, 'rethrow', [RangeError], { return: true }));
expect.type<Promise<TypeError | undefined>>(Bounce.background(async () => undefined, undefined, undefined, { return: true, override: new TypeError() }));

expect.error(Bounce.background());
expect.error(Bounce.background(true, 'unknown'));

// isBoom()

expect.type<boolean>(Bounce.isBoom(new Error()));
expect.type<boolean>(Bounce.isBoom({}));
{
    const obj = {};
    if (Bounce.isBoom(obj)) {
        expect.type<Boom.Boom>(obj);       // Narrows type
    }
}

expect.error(Bounce.isBoom());

// isError()

expect.type<boolean>(Bounce.isError(new Error()));
expect.type<boolean>(Bounce.isError(true));
{
    const obj = {};
    if (Bounce.isError(obj)) {
        expect.type<Error>(obj);           // Narrows type
    }
}

expect.error(Bounce.isError());

// isSystem()

expect.type<boolean>(Bounce.isSystem(new Error()));
{
    const err = new TypeError();
    if (Bounce.isSystem(err)) {
        expect.type<TypeError>(err);       // Does not narrow type
    }
}
{
    const obj = {};
    if (Bounce.isSystem(obj)) {
        expect.type<Error>(obj);           // Narrows type
    }
}

expect.error(Bounce.isSystem());

// isAbort()

expect.type<boolean>(Bounce.isAbort(0));
{
    const err = AbortSignal.abort().reason as any;
    if (Bounce.isAbort(err)) {
        expect.type<Error>(err);                       // Narrows type
        expect.type<'AbortError'>(err.name);           // Narrows name
    }
}

expect.error(Bounce.isAbort());

// isTimeout()

expect.type<boolean>(Bounce.isTimeout(0));
{
    const err = AbortSignal.timeout(1).reason as any;
    if (Bounce.isTimeout(err)) {
        expect.type<Error>(err);                       // Narrows type
        expect.type<'TimeoutError'>(err.name);         // Narrows name
    }
}

expect.error(Bounce.isTimeout());
