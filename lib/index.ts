import { createServer, bodyParser, queryParser } from 'restify';
import { DRegisterServer, Log } from '@seatbelt/core';

export function DRestify(): any {
  return function(originalClassConstructor: new () => {}) {
    @DRegisterServer()
    class RestifyServer extends originalClassConstructor {
      constructor() {
        super();
      }
      public log = new Log('RestifyServer');
      public server = createServer();
      public port = process.env.port || 3000;
      public __controller_wrapper__: Function = function (route: any, req: any, res: any) {
        route.controller({
          send: (...params: any[]) => res.send(...params),
          params: Object.assign(
            {},
            typeof req.query === 'object' ? req.query : {},
            typeof req.params === 'object' ? req.params : {},
            typeof req.body === 'object' ? req.body : {}
          )
        }, {
          req,
          res
        });
      };
      public __seatbelt_server_config__: Function = function(routes: any[]) {
        this.server.use(bodyParser());
        this.server.use(queryParser());

        if (routes && Array.isArray(routes)) {
          routes.forEach((route: any) => {
            route['__seatbelt_config__'].type.forEach((eachType: string) => {
              route['__seatbelt_config__'].path.forEach((eachPath: string) => {
                this.server[eachType.toLowerCase()](eachPath, (req: any, res: any, next: Function) => this.__controller_wrapper__(route, req, res, next));
              });
            });
          });
        }
      };
      public __seatbelt_server_init__: Function = function () {
        this.log.system(`starting server on ${this.port}`);
        this.server.listen(this.port);
      };
    }
    return RestifyServer;
  };
}
