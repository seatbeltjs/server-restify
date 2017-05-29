var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const restify_1 = require("restify");
const core_1 = require("@seatbelt/core");
function DRestify() {
    return function (originalClassConstructor) {
        let RestifyServer = class RestifyServer extends originalClassConstructor {
            constructor() {
                super();
                this.log = new core_1.Log('RestifyServer');
                this.server = restify_1.createServer();
                this.port = process.env.port || 3000;
                this.__controller_wrapper__ = function (route, req, res) {
                    route.controller({
                        send: (...params) => res.send(...params),
                        params: Object.assign({}, typeof req.query === 'object' ? req.query : {}, typeof req.params === 'object' ? req.params : {}, typeof req.body === 'object' ? req.body : {})
                    }, {
                        req,
                        res
                    });
                };
                this.__seatbelt_server_config__ = function (routes) {
                    this.server.use(restify_1.bodyParser());
                    this.server.use(restify_1.queryParser());
                    if (routes && Array.isArray(routes)) {
                        routes.forEach((route) => {
                            route['__seatbelt_config__'].type.forEach((eachType) => {
                                route['__seatbelt_config__'].path.forEach((eachPath) => {
                                    this.server[eachType.toLowerCase()](eachPath, (req, res, next) => this.__controller_wrapper__(route, req, res, next));
                                });
                            });
                        });
                    }
                };
                this.__seatbelt_server_init__ = function () {
                    this.log.system(`starting server on ${this.port}`);
                    this.server.listen(this.port);
                };
            }
        };
        RestifyServer = __decorate([
            core_1.DRegisterServer()
        ], RestifyServer);
        return RestifyServer;
    };
}
exports.DRestify = DRestify;
