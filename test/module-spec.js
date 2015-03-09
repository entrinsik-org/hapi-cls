'use strict';

var should = require('chai').should();
var hapi = require('hapi');
var lib = require('../');

describe('hapi-cls', function () {
    var server;

    beforeEach(function () {
        server = new hapi.Server();
        server.connection();
    });

    it('should throw an error if the namespace name isnt supplied', function () {
        server.register.bind(server, { register: lib, options: {}}).should.throw();
    });

    it('should not require an appVar', function (done) {
        server.register({ register: lib, options: { namespace: 'namespace' }}, done);
    });

    describe('when the plugin has been registered', function () {
        beforeEach(function (done) {
            server.register({ register: lib, options: { namespace: 'foo', appVar: 'namespace' }}, done);
        });

        it('should exist', function () {
            should.exist(lib);
        });

        it('should register a namespace with hapi', function () {
            server.plugins.should.have.property('ent-hapi-cls');
            server.app.should.have.property('namespace');
        });

        it('should bind the request to the namespace', function (done) {
            server.route({
                path: '/foo',
                method: 'get',
                handler: function (req) {
                    var request = req.server.app.namespace.get('request');
                    request.should.equal(req);
                    done();
                }
            });

            server.inject('/foo');
        });
    });
});