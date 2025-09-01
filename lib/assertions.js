'use strict';

const Assert = require('assert');

const AssertError = require('@hapi/hoek/assertError');


module.exports = [

    // Node

    Assert.AssertionError,

    // Hoek

    AssertError
];
