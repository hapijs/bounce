'use strict';

// Add custom assertion to assertion list. Must be done before requiring Bounce

class HasInstanceCheckError {

    static [Symbol.hasInstance](instance) {

        return instance.message === 'custom-error';
    }
}

const Assertions = require('../lib/assertions');

Assertions.push(HasInstanceCheckError);


const Assert = require('assert');

const Code = require('@hapi/code');
const Boom = require('@hapi/boom');
const Bounce = require('..');
const Hoek = require('@hapi/hoek');
const Lab = require('@hapi/lab');


const internals = {};


const { describe, it } = exports.lab = Lab.script();
const expect = Code.expect;


describe('Bounce', () => {

    describe('rethrow()', () => {

        it('throws TypeError on missing types', () => {

            const orig = new Error('Something');

            try {
                Bounce.rethrow(orig);
            }
            catch (err) {
                var error = err;
            }

            expect(error).to.not.shallow.equal(orig);
            expect(error).to.be.an.error(TypeError);
        });

        it('throws TypeError on unhandled types', () => {

            expect(() => Bounce.rethrow(new Error(), false)).to.throw(TypeError, 'Missing or invalid "types" argument');
            expect(() => Bounce.rethrow(new Error(), 'invalid')).to.throw(TypeError, 'Invalid "types" argument');
            expect(() => Bounce.rethrow(new Error(), ['invalid'])).to.throw(TypeError, 'Invalid "types" argument');
            expect(() => Bounce.rethrow(new Error(), 123)).to.throw(TypeError, 'Invalid "types" argument');
            expect(() => Bounce.rethrow(new Error(), () => 123)).to.throw(TypeError, 'Invalid "types" argument');
        });

        it('rethrows only system errors', () => {

            try {
                Bounce.rethrow(new Error('Something'), 'system');
            }
            catch (err) {
                var error1 = err;
            }

            expect(error1).to.not.exist();

            try {
                Bounce.rethrow(new URIError('Something'), 'system');
            }
            catch (err) {
                var error2 = err;
            }

            expect(error2).to.be.an.error('Something', URIError);
        });

        it('rethrows only boom errors', () => {

            try {
                Bounce.rethrow(new Error('Something'), Boom.Boom);
            }
            catch (err) {
                var error1 = err;
            }

            expect(error1).to.not.exist();

            try {
                Bounce.rethrow(Boom.badRequest('Something'), Boom.Boom);
            }
            catch (err) {
                var error2 = err;
            }

            expect(error2).to.be.an.error('Something');
        });

        it('rethrows only boom/system errors', () => {

            try {
                Bounce.rethrow(new Error('Something'), [Boom.Boom, 'system']);
            }
            catch (err) {
                var error1 = err;
            }

            expect(error1).to.not.exist();

            try {
                Bounce.rethrow(Boom.badRequest('Something'), [Boom.Boom, 'system']);
            }
            catch (err) {
                var error2 = err;
            }

            expect(error2).to.be.an.error('Something');

            try {
                Bounce.rethrow(new SyntaxError('Something'), [Boom.Boom, 'system']);
            }
            catch (err) {
                var error3 = err;
            }

            expect(error3).to.be.an.error('Something', SyntaxError);
        });

        it('rethrows only abort errors', () => {

            try {
                Bounce.rethrow(new Error('Something'), 'abort');
            }
            catch (err) {
                var error1 = err;
            }

            expect(error1).to.not.exist();

            try {
                Bounce.rethrow(AbortSignal.abort().reason, 'abort');
            }
            catch (err) {
                var error2 = err;
            }

            expect(error2).to.be.an.error(DOMException);
            expect(error2.name).to.equal('AbortError');
        });

        it('rethrows only timeout errors', async () => {

            try {
                Bounce.rethrow(new Error('Something'), 'timeout');
            }
            catch (err) {
                var error1 = err;
            }

            expect(error1).to.not.exist();

            try {
                const signal = AbortSignal.timeout(0);
                await Hoek.wait(1);
                Bounce.rethrow(signal.reason, 'timeout');
            }
            catch (err) {
                var error2 = err;
            }

            expect(error2).to.be.an.error(DOMException);
            expect(error2.name).to.equal('TimeoutError');
        });

        it('rethrows only specified errors', () => {

            try {
                Bounce.rethrow(new Error('Something'), URIError);
            }
            catch (err) {
                var error1 = err;
            }

            expect(error1).to.not.exist();

            try {
                Bounce.rethrow(new URIError('Something'), URIError);
            }
            catch (err) {
                var error2 = err;
            }

            expect(error2).to.be.an.error('Something', URIError);
        });

        it('rethrows only specified errors', () => {

            try {
                Bounce.rethrow(new Error('Something'), URIError);
            }
            catch (err) {
                var error1 = err;
            }

            expect(error1).to.not.exist();

            try {
                Bounce.rethrow(new URIError('Something'), URIError);
            }
            catch (err) {
                var error2 = err;
            }

            expect(error2).to.be.an.error('Something', URIError);
        });

        it('rethrows only errors matching a pattern', () => {

            try {
                Bounce.rethrow(new Error('Something'), { x: 1 });
            }
            catch (err) {
                var error1 = err;
            }

            expect(error1).to.not.exist();

            const xErr = new Error('Something');
            xErr.x = 1;

            try {
                Bounce.rethrow(xErr, { x: 1 });
            }
            catch (err) {
                var error2 = err;
            }

            expect(error2).to.be.an.error('Something');
        });

        it('rethrows only errors matching a pattern (deep)', () => {

            try {
                Bounce.rethrow(new Error('Something'), { x: { y: 2 } });
            }
            catch (err) {
                var error1 = err;
            }

            expect(error1).to.not.exist();

            const xErr = new Error('Something');
            xErr.x = { y: 2, z: 4 };

            try {
                Bounce.rethrow(xErr, { x: { y: 2 } });
            }
            catch (err) {
                var error2 = err;
            }

            expect(error2).to.be.an.error('Something');
        });

        it('ignores non-errors matching a pattern', () => {

            const nonErr = { x: 1 };

            try {
                Bounce.rethrow(nonErr, { x: 1 }, { strict: false });
            }
            catch (err) {
                var error = err;
            }

            expect(error).to.not.exist();
        });

        it('rethrows a decorated error', () => {

            const orig = new Error('Something');
            const decorate = { x: 1, y: 'z' };

            try {
                Bounce.rethrow(orig, Error, { decorate });
            }
            catch (err) {
                var error = err;
            }

            expect(error).to.shallow.equal(orig);
            expect(error).to.be.an.error('Something');
            expect(error.x).to.equal(1);
            expect(error.y).to.equal('z');
        });

        it('throws a different error', () => {

            const orig = new Error('Something');

            try {
                Bounce.rethrow(orig, Error, { override: new Error('Else') });
            }
            catch (err) {
                var error = err;
            }

            expect(error).to.not.shallow.equal(orig);
            expect(error).to.be.an.error('Else');
        });

        it('returns error instead of throwing', () => {

            const orig = new Error('Something');

            expect(() => Bounce.rethrow(orig, Error, { return: true })).to.not.throw();

            const error = Bounce.rethrow(orig, Error, { return: true });
            expect(error).to.shallow.equal(orig);
            expect(error).to.be.an.error('Something');
        });

        it('preserves non-errors', () => {

            try {
                Bounce.rethrow('error', [], { strict: false });
            }
            catch (err) {
                var error = err;
            }

            expect(error).to.not.exist();
        });

        it('rethrows already aborted signal reason', () => {

            const orig = new Error('Something');
            const signal = AbortSignal.abort(new Error('Fail'));

            try {
                Bounce.rethrow(orig, Error, { signal });
            }
            catch (err) {
                var error = err;
            }

            expect(error).to.shallow.equal(signal.reason);
            expect(error).to.be.an.error('Fail');
        });

        it('rethrows already aborted signal with no reason', () => {

            const orig = new Error('Something');
            const signal = AbortSignal.abort();

            Object.defineProperty(signal, 'reason', { value: undefined });     // Simulate older API without the reason property

            try {
                Bounce.rethrow(orig, Error, { signal });
            }
            catch (err) {
                var error = err;
            }

            expect(error).to.be.an.error(DOMException, 'This operation was aborted');
        });

        it('ignores non-aborted signal', () => {

            const orig = new Error('Something');
            const signal = new AbortController().signal;

            try {
                Bounce.rethrow(orig, Error, { signal });
            }
            catch (err) {
                var error = err;
            }

            expect(error).to.shallow.equal(orig);
            expect(error).to.be.an.error('Something');
        });

        it('always throws TypeError for non-errors when strict', () => {

            const orig = 'error';

            try {
                Bounce.rethrow(orig, [], { strict: true });
            }
            catch (err) {
                var error1 = err;
            }

            expect(error1).to.be.an.error(TypeError);
            expect(error1.cause).to.shallow.equal(orig);

            try {
                Bounce.rethrow(orig, [], { strict: true });
            }
            catch (err) {
                var error2 = err;
            }

            expect(error2).to.be.an.error(TypeError);
            expect(error2.cause).to.shallow.equal(orig);
        });
    });

    describe('assert()', () => {

        it('ignores system errors', () => {

            try {
                Bounce.assert(new Error('Something'), 'system');
            }
            catch (err) {
                var error1 = err;
            }

            expect(error1).to.be.an.error('Something', Error);

            try {
                Bounce.assert(new URIError('Something'), 'system');
            }
            catch (err) {
                var error2 = err;
            }

            expect(error2).to.not.exist();
        });

        it('ignores boom errors', () => {

            try {
                Bounce.assert(new Error('Something'), Boom.Boom);
            }
            catch (err) {
                var error1 = err;
            }

            expect(error1).to.be.an.error('Something', Error);

            try {
                Bounce.assert(Boom.badRequest('Something'), Boom.Boom);
            }
            catch (err) {
                var error2 = err;
            }

            expect(error2).to.not.exist();
        });

        it('ignores boom/system errors', () => {

            try {
                Bounce.assert(new Error('Something'), [Boom.Boom, 'system']);
            }
            catch (err) {
                var error1 = err;
            }

            expect(error1).to.be.an.error('Something', Error);

            try {
                Bounce.assert(Boom.badRequest('Something'), [Boom.Boom, 'system']);
            }
            catch (err) {
                var error2 = err;
            }

            expect(error2).to.not.exist();

            try {
                Bounce.assert(new ReferenceError('Something'), [Boom.Boom, 'system']);
            }
            catch (err) {
                var error3 = err;
            }

            expect(error3).to.not.exist();
        });

        it('always throws non-errors', () => {

            const orig = 'error';

            try {
                Bounce.assert(orig, [], { strict: false });
            }
            catch (err) {
                var error = err;
            }

            expect(error).to.shallow.equal(orig);
        });

        it('rethrows already aborted signal reason', () => {

            const orig = new Error('Something');
            const signal = AbortSignal.abort(new Error('Fail'));

            try {
                Bounce.assert(orig, 'system', { signal });
            }
            catch (err) {
                var error = err;
            }

            expect(error).to.shallow.equal(signal.reason);
            expect(error).to.be.an.error('Fail');
        });

        it('ignores non-aborted signal', () => {

            const orig = new Error('Something');
            const signal = new AbortController().signal;

            try {
                Bounce.assert(orig, 'system', { signal });
            }
            catch (err) {
                var error = err;
            }

            expect(error).to.shallow.equal(orig);
            expect(error).to.be.an.error('Something');
        });

        it('always throws TypeError for non-errors when strict', () => {

            const orig = 'error';

            try {
                Bounce.assert(orig, [], { strict: true });
            }
            catch (err) {
                var error1 = err;
            }

            expect(error1).to.be.an.error(TypeError);
            expect(error1.cause).to.shallow.equal(orig);

            try {
                Bounce.assert(orig, [], { strict: true });
            }
            catch (err) {
                var error2 = err;
            }

            expect(error2).to.be.an.error(TypeError);
            expect(error2.cause).to.shallow.equal(orig);
        });
    });

    describe('background()', () => {

        it('rethrows system errors', async () => {

            const test = async () => {

                await Hoek.wait(10);
                throw new SyntaxError('Something');
            };

            try {
                await Bounce.background(test(), 'rethrow', 'system');
            }
            catch (err) {
                var error = err;
            }

            expect(error).to.exist();
        });

        it('rethrows system errors (defaults)', async () => {

            const test = async () => {

                await Hoek.wait(10);
                throw new SyntaxError('Something');
            };

            try {
                await Bounce.background(test());
            }
            catch (err) {
                var error = err;
            }

            expect(error).to.exist();
        });

        it('ignores system errors', async () => {

            const test = async () => {

                await Hoek.wait(10);
                throw new Error('Something');
            };

            try {
                await Bounce.background(test(), 'rethrow', 'system');
            }
            catch (err) {
                var error = err;
            }

            expect(error).to.not.exist();
        });

        it('ignores system errors (background)', () => {

            const test = async () => {

                await Hoek.wait(10);
                throw new Error('Something');
            };

            Bounce.background(test(), 'rethrow', 'system');
        });

        it('rethrows system errors (sync)', async () => {

            const test = () => {

                throw new SyntaxError('Something');
            };

            try {
                await Bounce.background(test, 'rethrow', 'system');
            }
            catch (err) {
                var error = err;
            }

            expect(error).to.exist();
        });

        it('ignores system errors (sync)', async () => {

            const test = () => {

                throw new Error('Something');
            };

            try {
                await Bounce.background(test, 'rethrow', 'system');
            }
            catch (err) {
                var error = err;
            }

            expect(error).to.not.exist();
        });

        it('ignores system errors (background sync)', () => {

            const test = () => {

                throw new Error('Something');
            };

            Bounce.background(test, 'rethrow', 'system');
        });

        it('supports the return option', async () => {

            const test = async () => {

                await Hoek.wait(1);
                throw new SyntaxError('Something');
            };

            const res = await Bounce.background(test(), 'rethrow', 'system', { return: true });
            expect(res).to.exist();
            expect(res).to.be.an.error(SyntaxError);
        });
    });

    describe('isSystem()', () => {

        it('identifies EvalError as system', () => {

            expect(Bounce.isSystem(new EvalError())).to.be.true();
        });

        it('identifies RangeError as system', () => {

            expect(Bounce.isSystem(new RangeError())).to.be.true();
        });

        it('identifies ReferenceError as system', () => {

            expect(Bounce.isSystem(new ReferenceError())).to.be.true();
        });

        it('identifies SyntaxError as system', () => {

            expect(Bounce.isSystem(new SyntaxError())).to.be.true();
        });

        it('identifies TypeError as system', () => {

            expect(Bounce.isSystem(new TypeError())).to.be.true();
        });

        it('identifies URIError as system', () => {

            expect(Bounce.isSystem(new URIError())).to.be.true();
        });

        it('identifies node AssertionError as system', () => {

            expect(Bounce.isSystem(new Assert.AssertionError({}))).to.be.true();
        });

        it('identifies custom assertion Error as system', () => {

            expect(Bounce.isSystem(new Error('custom-error'))).to.be.true();
        });

        it('identifies hoek Error as system', () => {

            expect(Bounce.isSystem(new Hoek.AssertError([]))).to.be.true();
        });

        it('identifies Error as non-system', () => {

            expect(Bounce.isSystem(new Error())).to.be.false();
        });

        it('identifies Boom as non-system', () => {

            expect(Bounce.isSystem(Boom.badRequest())).to.be.false();
        });

        it('identifies object as non-system', () => {

            expect(Bounce.isSystem({})).to.be.false();
        });

        it('identifies null as non-system', () => {

            expect(Bounce.isSystem(null)).to.be.false();
        });

        it('identifies boomified system as non-system', () => {

            expect(Bounce.isSystem(Boom.boomify(new TypeError()))).to.be.false();
        });
    });

    describe('isAbort()', () => {

        it('identifies AbortSignal.abort() reason as abort', () => {

            expect(Bounce.isAbort(AbortSignal.abort().reason)).to.be.true();
        });

        it('identifies DOMException AbortError as abort', () => {

            expect(Bounce.isAbort(new DOMException('aborted', 'AbortError'))).to.be.true();
        });

        it('identifies Error with name "AbortError" as abort', () => {

            class MyAbort extends Error {
                name = 'AbortError';
            }

            expect(Bounce.isAbort(new MyAbort())).to.be.true();
        });

        it('identifies object as non-abort', () => {

            expect(Bounce.isAbort({})).to.be.false();
        });

        it('identifies error as non-abort', () => {

            expect(Bounce.isAbort(new Error('failed'))).to.be.false();
        });

        it('identifies object with name "AbortError" as non-abort', () => {

            expect(Bounce.isAbort({ name: 'AbortError' })).to.be.false();
        });

        it('identifies AbortSignal.timeout() reason non-abort', async () => {

            const signal = AbortSignal.timeout(0);
            await Hoek.wait(1);
            expect(Bounce.isAbort(signal.reason)).to.be.false();
        });
    });

    describe('isTimeout()', () => {

        it('identifies AbortSignal.timeout() reason as timeout', async () => {

            const signal = AbortSignal.timeout(0);
            await Hoek.wait(1);
            expect(Bounce.isTimeout(signal.reason)).to.be.true();
        });

        it('identifies DOMException TimeoutError as timeout', () => {

            expect(Bounce.isTimeout(new DOMException('timed out', 'TimeoutError'))).to.be.true();
        });

        it('identifies Error with name "TimeoutError" as timeout', () => {

            class MyTimeout extends Error {
                name = 'TimeoutError';
            }

            expect(Bounce.isTimeout(new MyTimeout())).to.be.true();
        });

        it('identifies object as non-timeout', () => {

            expect(Bounce.isTimeout({})).to.be.false();
        });

        it('identifies error as non-timeout', () => {

            expect(Bounce.isTimeout(new Error('failed'))).to.be.false();
        });

        it('identifies object with name "TimeoutError" as non-timeout', () => {

            expect(Bounce.isTimeout({ name: 'TimeoutError' })).to.be.false();
        });
    });
});
