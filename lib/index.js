"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const restify_1 = require("restify");
function DRestify() {
    return function (OriginalClassConstructor) {
        return function () {
            const origin = new OriginalClassConstructor();
            origin.__seatbelt__ = 'server';
            origin.__seatbelt_strap__ = function (classesByType) {
                origin.restify = require('restify');
                origin.app = restify_1.createServer();
                origin.port = process.env.port || 3000;
                origin.app.use(origin.restify.bodyParser());
                origin.app.use(origin.restify.queryParser());
                origin.__controller_wrapper__ = function (controllerFunction, req, res, next) {
                    controllerFunction({
                        next,
                        reply: (...params) => res.send(...params),
                        params: Object.assign({}, typeof req.query === 'object' ? req.query : {}, typeof req.params === 'object' ? req.params : {}, typeof req.body === 'object' ? req.body : {})
                    }, {
                        req,
                        res
                    });
                };
                if (classesByType['route']) {
                    classesByType['route'].forEach((route) => {
                        const policies = [];
                        route.__seatbelt_config__.policies.forEach((routePolicyName) => {
                            classesByType['policy'].forEach((policy) => {
                                if (routePolicyName === policy.__name__) {
                                    policies.push((req, res, next) => origin.__controller_wrapper__(policy.controller, req, res, next));
                                }
                            });
                        });
                        const policiesPlusController = [
                            ...policies,
                            (req, res, next) => origin.__controller_wrapper__(route.controller, req, res, next)
                        ];
                        route['__seatbelt_config__'].type.forEach((eachType) => {
                            route['__seatbelt_config__'].path.forEach((eachPath) => {
                                origin.app[eachType.toLowerCase()](eachPath, ...policiesPlusController);
                            });
                        });
                    });
                }
                origin.app.listen(origin.port);
            };
            return origin;
        };
    };
}
exports.DRestify = DRestify;
