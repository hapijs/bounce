import { AssertionError } from 'node:assert';

import * as Boom from '@hapi/boom';
import * as Hoek from '@hapi/hoek';
import { describe, expect, it } from 'vitest';

import * as Bounce from '../src/index.js';

describe('Bounce', () => {
    it('exposes the public API as named exports', () => {
        expect(Object.keys(Bounce).sort()).toEqual([
            'background',
            'ignore',
            'isBoom',
            'isError',
            'isSystem',
            'rethrow',
        ]);
    });

    describe('rethrow()', () => {
        it('rethrows all errors', () => {
            const orig = new Error('Something');

            try {
                Bounce.rethrow(orig);
            } catch (err) {
                var error = err;
            }

            expect(error).toBe(orig);
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Something');
        });

        it('rethrows only system errors', () => {
            try {
                Bounce.rethrow(new Error('Something'), 'system');
            } catch (err) {
                var error1 = err;
            }

            expect(error1).toBeUndefined();

            try {
                Bounce.rethrow(new URIError('Something'), 'system');
            } catch (err) {
                var error2 = err;
            }

            expect(error2).toBeInstanceOf(URIError);
            expect(error2.message).toBe('Something');
        });

        it('rethrows only boom errors', () => {
            try {
                Bounce.rethrow(new Error('Something'), 'boom');
            } catch (err) {
                var error1 = err;
            }

            expect(error1).toBeUndefined();

            try {
                Bounce.rethrow(Boom.badRequest('Something'), 'boom');
            } catch (err) {
                var error2 = err;
            }

            expect(error2).toBeInstanceOf(Error);
            expect(error2.message).toBe('Something');
        });

        it('rethrows only boom/system errors', () => {
            try {
                Bounce.rethrow(new Error('Something'), ['boom', 'system']);
            } catch (err) {
                var error1 = err;
            }

            expect(error1).toBeUndefined();

            try {
                Bounce.rethrow(Boom.badRequest('Something'), ['boom', 'system']);
            } catch (err) {
                var error2 = err;
            }

            expect(error2).toBeInstanceOf(Error);
            expect(error2.message).toBe('Something');

            try {
                Bounce.rethrow(new SyntaxError('Something'), ['boom', 'system']);
            } catch (err) {
                var error3 = err;
            }

            expect(error3).toBeInstanceOf(SyntaxError);
            expect(error3.message).toBe('Something');
        });

        it('rethrows only specified errors', () => {
            try {
                Bounce.rethrow(new Error('Something'), URIError);
            } catch (err) {
                var error1 = err;
            }

            expect(error1).toBeUndefined();

            try {
                Bounce.rethrow(new URIError('Something'), URIError);
            } catch (err) {
                var error2 = err;
            }

            expect(error2).toBeInstanceOf(URIError);
            expect(error2.message).toBe('Something');
        });

        it('rethrows only specified errors', () => {
            try {
                Bounce.rethrow(new Error('Something'), URIError);
            } catch (err) {
                var error1 = err;
            }

            expect(error1).toBeUndefined();

            try {
                Bounce.rethrow(new URIError('Something'), URIError);
            } catch (err) {
                var error2 = err;
            }

            expect(error2).toBeInstanceOf(URIError);
            expect(error2.message).toBe('Something');
        });

        it('rethrows only errors matching a pattern', () => {
            try {
                Bounce.rethrow(new Error('Something'), { x: 1 });
            } catch (err) {
                var error1 = err;
            }

            expect(error1).toBeUndefined();

            const xErr = new Error('Something');
            xErr.x = 1;

            try {
                Bounce.rethrow(xErr, { x: 1 });
            } catch (err) {
                var error2 = err;
            }

            expect(error2).toBeInstanceOf(Error);
            expect(error2.message).toBe('Something');
        });

        it('rethrows only errors matching a pattern (deep)', () => {
            try {
                Bounce.rethrow(new Error('Something'), { x: { y: 2 } });
            } catch (err) {
                var error1 = err;
            }

            expect(error1).toBeUndefined();

            const xErr = new Error('Something');
            xErr.x = { y: 2, z: 4 };

            try {
                Bounce.rethrow(xErr, { x: { y: 2 } });
            } catch (err) {
                var error2 = err;
            }

            expect(error2).toBeInstanceOf(Error);
            expect(error2.message).toBe('Something');
        });

        it('rethrows a decorated error', () => {
            const orig = new Error('Something');
            const decorate = { x: 1, y: 'z' };

            try {
                Bounce.rethrow(orig, Error, { decorate });
            } catch (err) {
                var error = err;
            }

            expect(error).toBe(orig);
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Something');
            expect(error.x).toBe(1);
            expect(error.y).toBe('z');
        });

        it('throws a different error', () => {
            const orig = new Error('Something');

            try {
                Bounce.rethrow(orig, Error, { override: new Error('Else') });
            } catch (err) {
                var error = err;
            }

            expect(error).not.toBe(orig);
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Else');
        });

        it('returns error instead of throwing', () => {
            const orig = new Error('Something');

            expect(() => Bounce.rethrow(orig, Error, { return: true })).not.toThrow();

            const error = Bounce.rethrow(orig, Error, { return: true });
            expect(error).toBe(orig);
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Something');
        });
    });

    describe('ignore()', () => {
        it('ignores system errors', () => {
            try {
                Bounce.ignore(new Error('Something'), 'system');
            } catch (err) {
                var error1 = err;
            }

            expect(error1).toBeInstanceOf(Error);
            expect(error1.message).toBe('Something');

            try {
                Bounce.ignore(new URIError('Something'), 'system');
            } catch (err) {
                var error2 = err;
            }

            expect(error2).toBeUndefined();
        });

        it('ignores boom errors', () => {
            try {
                Bounce.ignore(new Error('Something'), 'boom');
            } catch (err) {
                var error1 = err;
            }

            expect(error1).toBeInstanceOf(Error);
            expect(error1.message).toBe('Something');

            try {
                Bounce.ignore(Boom.badRequest('Something'), 'boom');
            } catch (err) {
                var error2 = err;
            }

            expect(error2).toBeUndefined();
        });

        it('ignores boom/system errors', () => {
            try {
                Bounce.ignore(new Error('Something'), ['boom', 'system']);
            } catch (err) {
                var error1 = err;
            }

            expect(error1).toBeInstanceOf(Error);
            expect(error1.message).toBe('Something');

            try {
                Bounce.ignore(Boom.badRequest('Something'), ['boom', 'system']);
            } catch (err) {
                var error2 = err;
            }

            expect(error2).toBeUndefined();

            try {
                Bounce.ignore(new ReferenceError('Something'), ['boom', 'system']);
            } catch (err) {
                var error3 = err;
            }

            expect(error3).toBeUndefined();
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
            } catch (err) {
                var error = err;
            }

            expect(error).toBeDefined();
        });

        it('rethrows system errors (defaults)', async () => {
            const test = async () => {
                await Hoek.wait(10);
                throw new SyntaxError('Something');
            };

            try {
                await Bounce.background(test());
            } catch (err) {
                var error = err;
            }

            expect(error).toBeDefined();
        });

        it('ignores system errors', async () => {
            const test = async () => {
                await Hoek.wait(10);
                throw new Error('Something');
            };

            try {
                await Bounce.background(test(), 'rethrow', 'system');
            } catch (err) {
                var error = err;
            }

            expect(error).toBeUndefined();
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
            } catch (err) {
                var error = err;
            }

            expect(error).toBeDefined();
        });

        it('ignores system errors (sync)', async () => {
            const test = () => {
                throw new Error('Something');
            };

            try {
                await Bounce.background(test, 'rethrow', 'system');
            } catch (err) {
                var error = err;
            }

            expect(error).toBeUndefined();
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
            expect(res).toBeDefined();
            expect(res).toBeInstanceOf(SyntaxError);
        });
    });

    describe('isBoom()', () => {
        it('identifies Boom as Boom', () => {
            expect(Bounce.isBoom(Boom.badRequest())).toBe(true);
        });

        it('identifies EvalError as non-boom', () => {
            expect(Bounce.isBoom(new EvalError())).toBe(false);
        });

        it('identifies object as non-boom', () => {
            expect(Bounce.isBoom({})).toBe(false);
        });

        it('identifies object with isBoom as non-boom', () => {
            expect(Bounce.isBoom({ isBoom: true })).toBe(false);
        });
    });

    describe('isError()', () => {
        it('identifies Error as error', () => {
            expect(Bounce.isError(new Error())).toBe(true);
        });

        it('identifies Boom as error', () => {
            expect(Bounce.isError(Boom.badRequest())).toBe(true);
        });

        it('identifies object as non-error', () => {
            expect(Bounce.isBoom({})).toBe(false);
        });
    });

    describe('isSystem()', () => {
        it('identifies EvalError as system', () => {
            expect(Bounce.isSystem(new EvalError())).toBe(true);
        });

        it('identifies RangeError as system', () => {
            expect(Bounce.isSystem(new RangeError())).toBe(true);
        });

        it('identifies ReferenceError as system', () => {
            expect(Bounce.isSystem(new ReferenceError())).toBe(true);
        });

        it('identifies SyntaxError as system', () => {
            expect(Bounce.isSystem(new SyntaxError())).toBe(true);
        });

        it('identifies TypeError as system', () => {
            expect(Bounce.isSystem(new TypeError())).toBe(true);
        });

        it('identifies URIError as system', () => {
            expect(Bounce.isSystem(new URIError())).toBe(true);
        });

        it('identifies node AssertionError as system', () => {
            expect(Bounce.isSystem(new AssertionError({}))).toBe(true);
        });

        it('identifies hoek Error as system', () => {
            expect(Bounce.isSystem(new Hoek.AssertError('Something'))).toBe(true);
        });

        it('identifies Error as non-system', () => {
            expect(Bounce.isSystem(new Error())).toBe(false);
        });

        it('identifies Boom as non-system', () => {
            expect(Bounce.isSystem(Boom.badRequest())).toBe(false);
        });

        it('identifies object as non-system', () => {
            expect(Bounce.isSystem({})).toBe(false);
        });

        it('identifies null as non-system', () => {
            expect(Bounce.isSystem(null)).toBe(false);
        });

        it('identifies boomified system as non-system', () => {
            expect(Bounce.isSystem(Boom.boomify(new TypeError()))).toBe(false);
        });
    });
});
