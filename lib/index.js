Object.defineProperty(exports, "__esModule", { value: true });
const restify_1 = require("restify");
function DRestify() {
    return function (originalClassConstructor) {
        return class extends originalClassConstructor {
            constructor() {
                super();
                this.__seatbelt__ = 'server';
                this.__seatbelt_strap__ = function (routes) {
                    this.server = restify_1.createServer();
                    this.port = process.env.port || 3000;
                    this.server.use(restify_1.bodyParser());
                    this.server.use(restify_1.queryParser());
                    this.__controller_wrapper__ = function (route, req, res) {
                        route.controller({
                            send: (...params) => res.send(...params),
                            params: Object.assign({}, typeof req.query === 'object' ? req.query : {}, typeof req.params === 'object' ? req.params : {}, typeof req.body === 'object' ? req.body : {})
                        }, {
                            req,
                            res
                        });
                    };
                    if (routes && Array.isArray(routes)) {
                        routes.forEach((route) => {
                            route['__seatbelt_config__'].type.forEach((eachType) => {
                                route['__seatbelt_config__'].path.forEach((eachPath) => {
                                    this.server[eachType.toLowerCase()](eachPath, (req, res, next) => this.__controller_wrapper__(route, req, res, next));
                                });
                            });
                        });
                    }
                    this.server.listen(this.port);
                };
            }
            ;
        };
    };
}
exports.DRestify = DRestify;
