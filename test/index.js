'use strict';

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

        it('rethrows all errors', () => {

            const orig = new Error('Something');

            try {
                Bounce.rethrow(orig);
            }
            catch (err) {
                var error = err;
            }

            expect(error).to.shallow.equal(orig);
            expect(error).to.be.an.error('Something');
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
                Bounce.rethrow(new Error('Something'), 'boom');
            }
            catch (err) {
                var error1 = err;
            }

            expect(error1).to.not.exist();

            try {
                Bounce.rethrow(Boom.badRequest('Something'), 'boom');
            }
            catch (err) {
                var error2 = err;
            }

            expect(error2).to.be.an.error('Something');
        });

        it('rethrows only boom/system errors', () => {

            try {
                Bounce.rethrow(new Error('Something'), ['boom', 'system']);
            }
            catch (err) {
                var error1 = err;
            }

            expect(error1).to.not.exist();

            try {
                Bounce.rethrow(Boom.badRequest('Something'), ['boom', 'system']);
            }
            catch (err) {
                var error2 = err;
            }

            expect(error2).to.be.an.error('Something');

            try {
                Bounce.rethrow(new SyntaxError('Something'), ['boom', 'system']);
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

        it('rethrows already aborted signal reason', () => {

            const orig = new Error('Something');
            const signal = AbortSignal.abort(new Error('Fail'));

            try {
                Bounce.rethrow(orig, null, { signal });
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
                Bounce.rethrow(orig, null, { signal });
            }
            catch (err) {
                var error = err;
            }

            expect(error).to.shallow.equal(orig);
            expect(error).to.be.an.error('Something');
        });
    });

    describe('ignore()', () => {

        it('ignores system errors', () => {

            try {
                Bounce.ignore(new Error('Something'), 'system');
            }
            catch (err) {
                var error1 = err;
            }

            expect(error1).to.be.an.error('Something', Error);

            try {
                Bounce.ignore(new URIError('Something'), 'system');
            }
            catch (err) {
                var error2 = err;
            }

            expect(error2).to.not.exist();
        });

        it('ignores boom errors', () => {

            try {
                Bounce.ignore(new Error('Something'), 'boom');
            }
            catch (err) {
                var error1 = err;
            }

            expect(error1).to.be.an.error('Something', Error);

            try {
                Bounce.ignore(Boom.badRequest('Something'), 'boom');
            }
            catch (err) {
                var error2 = err;
            }

            expect(error2).to.not.exist();
        });

        it('ignores boom/system errors', () => {

            try {
                Bounce.ignore(new Error('Something'), ['boom', 'system']);
            }
            catch (err) {
                var error1 = err;
            }

            expect(error1).to.be.an.error('Something', Error);

            try {
                Bounce.ignore(Boom.badRequest('Something'), ['boom', 'system']);
            }
            catch (err) {
                var error2 = err;
            }

            expect(error2).to.not.exist();

            try {
                Bounce.ignore(new ReferenceError('Something'), ['boom', 'system']);
            }
            catch (err) {
                var error3 = err;
            }

            expect(error3).to.not.exist();
        });

        it('rethrows already aborted signal reason', () => {

            const orig = new Error('Something');
            const signal = AbortSignal.abort(new Error('Fail'));

            try {
                Bounce.ignore(orig, 'system', { signal });
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
                Bounce.ignore(orig, 'system', { signal });
            }
            catch (err) {
                var error = err;
            }

            expect(error).to.shallow.equal(orig);
            expect(error).to.be.an.error('Something');
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
    });

    describe('isBoom()', () => {

        it('identifies Boom as Boom', () => {

            expect(Bounce.isBoom(Boom.badRequest())).to.be.true();
        });

        it('identifies EvalError as non-boom', () => {

            expect(Bounce.isBoom(new EvalError())).to.be.false();
        });

        it('identifies object as non-boom', () => {

            expect(Bounce.isBoom({})).to.be.false();
        });

        it('identifies object with isBoom as non-boom', () => {

            expect(Bounce.isBoom({ isBoom: true })).to.be.false();
        });
    });

    describe('isError()', () => {

        it('identifies Error as error', () => {

            expect(Bounce.isError(new Error())).to.be.true();
        });

        it('identifies Boom as error', () => {

            expect(Bounce.isError(Boom.badRequest())).to.be.true();
        });

        it('identifies object as non-error', () => {

            expect(Bounce.isBoom({})).to.be.false();
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
