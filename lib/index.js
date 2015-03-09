'use strict';

exports.register = function(server, opts, next) {
    if (!opts.namespace) next(new TypeError('namespace name required'));

    var cls = require('continuation-local-storage');
    var ns = cls.getNamespace(opts.namespace);
    if (!ns) ns = cls.createNamespace(opts.namespace);

    server.log(['ent-hapi-cls', 'info'], 'Created CLS namespace: ' + opts.namespace);

    if (opts.appVar) server.app[opts.appVar] = ns;

    server.expose('cls', cls);

    server.ext('onRequest', function (request, reply) {
        ns.bindEmitter(request.raw.req);
        ns.bindEmitter(request.raw.res);

        ns.run(function () {
            ns.set('request', request);
            reply.continue();
        });
    });

    next();
};

exports.register.attributes = { pkg: require('../package.json') };