import * as restify from 'restify';
import { ServerPlugin } from '@seatbelt/core/plugins';
import { Request, Response } from '@seatbelt/core';
import { Log } from '@seatbelt/core';

export interface IServerConfig {
  port?: number;
}

@ServerPlugin.Register({
  name: 'RestifyServer'
})
export class RestifyServer implements ServerPlugin.BaseServer {
  private log: Log = new Log('RestifyServer');
  public server: restify.Server = restify.createServer();
  public port: number = process.env.port || 3000;

  public constructor(config?: IServerConfig) {
    if (config) {
      if (config.port && typeof config.port === 'number') {
        this.port = config.port;
      }
    }
  }

  public conformServerControllerToSeatbeltController: Function = function (route: ServerPlugin.Route, req: restify.Request, res: restify.Response) {
    const send = (status: number, body: Object) => res.status(status).send(body);

    const seatbeltResponse: Response.Base = {
      send,
      ok: (body: Object) => send(200, body),
      created: (body: Object) => send(201, body),
      badRequest: (body: Object) => send(400, body),
      unauthorized: (body: Object) => send(401, body),
      forbidden: (body: Object) => send(403, body),
      notFound: (body: Object) => send(404, body),
      serverError: (body: Object) => send(500, body)
    };
    const seatbeltRequest: Request.Base = {
      allParams: Object.assign(
        {},
        typeof req.query === 'object' ? req.query : {},
        typeof req.params === 'object' ? req.params : {},
        typeof req.body === 'object' ? req.body : {}
      )
    };

    return route.controller(
      seatbeltRequest,
      seatbeltResponse,
      {
        req,
        res
      }
    );
  };

  public config: ServerPlugin.Config = function(seatbelt: any) {
    const routes: ServerPlugin.Route[] = seatbelt.plugins.route;

    this.server.use(restify.bodyParser());
    this.server.use(restify.queryParser());

    if (routes && Array.isArray(routes)) {
      routes.forEach((route: ServerPlugin.Route) => {
        route['__routeConfig'].type.forEach((eachType: string) => {
          route['__routeConfig'].path.forEach((eachPath: string) => {
            this.server[eachType.toLowerCase()](eachPath, (req: restify.Request, res: restify.Response) => this.conformServerControllerToSeatbeltController(route, req, res));
          });
        });
      });
    }
  };

  public init: ServerPlugin.Init = function () {
    this.log.system(`starting server on ${this.port}`);
    this.server.listen(this.port);
  };
}
