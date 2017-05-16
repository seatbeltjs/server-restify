import { createServer, bodyParser, queryParser } from 'restify';

export function DRestify(): any {
  return function(originalClassConstructor: new () => {}) {
    return class extends originalClassConstructor {
      public __seatbelt__: string;
      public __seatbelt_strap__: Function;
      constructor() {
        super();
        this.__seatbelt__ = 'server';
        this.__seatbelt_strap__ = function(routes: any[]) {
          this.server = createServer();
          this.port = process.env.port || 3000;
          this.server.use(bodyParser());
          this.server.use(queryParser());
          this.__controller_wrapper__ = function (route: any, req: any, res: any) {
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

          if (routes && Array.isArray(routes)) {
            routes.forEach((route: any) => {
              route['__seatbelt_config__'].type.forEach((eachType: string) => {
                route['__seatbelt_config__'].path.forEach((eachPath: string) => {
                  this.server[eachType.toLowerCase()](eachPath, (req: any, res: any, next: Function) => this.__controller_wrapper__(route, req, res, next));
                });
              });
            });
          }
          this.server.listen(this.port);
        };
      };
    };
  };
}
