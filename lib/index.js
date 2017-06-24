var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const restify = require("restify");
const server_1 = require("@seatbelt/core/lib/server");
const core_1 = require("@seatbelt/core");
let RestifyServer = class RestifyServer {
    constructor(config) {
        this.log = new core_1.Log('RestifyServer');
        this.server = restify.createServer();
        this.port = process.env.port || 3000;
        this.conformServerControllerToSeatbeltController = function (route, req, res) {
            const seatbeltResponse = {
                send: (status, body) => {
                    res.status(status);
                    return res.send(body);
                }
            };
            const seatbeltRequest = {
                allParams: Object.assign({}, typeof req.query === 'object' ? req.query : {}, typeof req.params === 'object' ? req.params : {}, typeof req.body === 'object' ? req.body : {})
            };
            return route.controller(seatbeltRequest, seatbeltResponse, {
                req,
                res
            });
        };
        this.config = function (routes) {
            this.server.use(restify.bodyParser());
            this.server.use(restify.queryParser());
            if (routes && Array.isArray(routes)) {
                routes.forEach((route) => {
                    route['__seatbeltConfig'].type.forEach((eachType) => {
                        route['__seatbeltConfig'].path.forEach((eachPath) => {
                            this.server[eachType.toLowerCase()](eachPath, (req, res) => this.conformServerControllerToSeatbeltController(route, req, res));
                        });
                    });
                });
            }
        };
        this.init = function () {
            this.log.system(`starting server on ${this.port}`);
            this.server.listen(this.port);
        };
        if (config) {
            if (config.port && typeof config.port === 'number') {
                this.port = config.port;
            }
        }
    }
};
RestifyServer = __decorate([
    server_1.Server.Register()
], RestifyServer);
exports.RestifyServer = RestifyServer;
