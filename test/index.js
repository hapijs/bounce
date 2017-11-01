'use strict';

// Load modules

const Code = require('code');
const Boom = require('boom');
const Bounce = require('..');
const Lab = require('lab');


// Declare internals

const internals = {};


// Test shortcuts

const { describe, it } = exports.lab = Lab.script();
const expect = Code.expect;


describe('Bounce', () => {

    describe('catch()', () => {

        it('bounces all errors', () => {

            const orig = new Error('Something');

            try {
                Bounce.catch(orig);
            }
            catch (err) {
                var error = err;
            }

            expect(error).to.shallow.equal(orig);
            expect(error).to.be.an.error('Something');
        });

        it('bounces only system errors', () => {

            try {
                Bounce.catch(new Error('Something'), { types: 'system' });
            }
            catch (err) {
                var error1 = err;
            }

            expect(error1).to.not.exist();

            try {
                Bounce.catch(new URIError('Something'), { types: 'system' });
            }
            catch (err) {
                var error2 = err;
            }

            expect(error2).to.be.an.error('Something', URIError);
        });

        it('bounces only non-system errors', () => {

            try {
                Bounce.catch(new Error('Something'), { types: 'system', not: true });
            }
            catch (err) {
                var error1 = err;
            }

            expect(error1).to.be.an.error('Something', Error);

            try {
                Bounce.catch(new URIError('Something'), { types: 'system', not: true });
            }
            catch (err) {
                var error2 = err;
            }

            expect(error2).to.not.exist();
        });

        it('bounces only boom errors', () => {

            try {
                Bounce.catch(new Error('Something'), { types: 'boom' });
            }
            catch (err) {
                var error1 = err;
            }

            expect(error1).to.not.exist();

            try {
                Bounce.catch(Boom.badRequest('Something'), { types: 'boom' });
            }
            catch (err) {
                var error2 = err;
            }

            expect(error2).to.be.an.error('Something');
        });

        it('bounces only non-boom errors', () => {

            try {
                Bounce.catch(new Error('Something'), { types: 'boom', not: true });
            }
            catch (err) {
                var error1 = err;
            }

            expect(error1).to.be.an.error('Something', Error);

            try {
                Bounce.catch(Boom.badRequest('Something'), { types: 'boom', not: true });
            }
            catch (err) {
                var error2 = err;
            }

            expect(error2).to.not.exist();
        });

        it('bounces only boom/system errors', () => {

            try {
                Bounce.catch(new Error('Something'), { types: ['boom', 'system'] });
            }
            catch (err) {
                var error1 = err;
            }

            expect(error1).to.not.exist();

            try {
                Bounce.catch(Boom.badRequest('Something'), { types: ['boom', 'system'] });
            }
            catch (err) {
                var error2 = err;
            }

            expect(error2).to.be.an.error('Something');

            try {
                Bounce.catch(new SyntaxError('Something'), { types: ['boom', 'system'] });
            }
            catch (err) {
                var error3 = err;
            }

            expect(error3).to.be.an.error('Something', SyntaxError);
        });

        it('bounces only non-boom/system errors', () => {

            try {
                Bounce.catch(new Error('Something'), { types: ['boom', 'system'], not: true });
            }
            catch (err) {
                var error1 = err;
            }

            expect(error1).to.be.an.error('Something', Error);

            try {
                Bounce.catch(Boom.badRequest('Something'), { types: ['boom', 'system'], not: true });
            }
            catch (err) {
                var error2 = err;
            }

            expect(error2).to.not.exist();

            try {
                Bounce.catch(new ReferenceError('Something'), { types: ['boom', 'system'], not: true });
            }
            catch (err) {
                var error3 = err;
            }

            expect(error3).to.not.exist();
        });

        it('bounces a decorated error', () => {

            const orig = new Error('Something');
            const decorate = { x: 1, y: 'z' };

            try {
                Bounce.catch(orig, { decorate });
            }
            catch (err) {
                var error = err;
            }

            expect(error).to.shallow.equal(orig);
            expect(error).to.be.an.error('Something');
            expect(error.x).to.equal(1);
            expect(error.y).to.equal('z');
        });
    });

    describe('decorate()', () => {

        it('adds properties to error', () => {

            const orig = new Error('Something');
            const properties = { x: 1, y: 'z' };

            try {
                Bounce.decorate(orig, properties);
            }
            catch (err) {
                var error = err;
            }

            expect(error).to.shallow.equal(orig);
            expect(error).to.be.an.error('Something');
            expect(error.x).to.equal(1);
            expect(error.y).to.equal('z');
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

        it('identifies Error as non-system', () => {

            expect(Bounce.isSystem(new Error())).to.be.false();
        });

        it('identifies Boom as non-system', () => {

            expect(Bounce.isSystem(Boom.badRequest())).to.be.false();
        });

        it('identifies object as non-system', () => {

            expect(Bounce.isSystem({})).to.be.false();
        });
    });
});
