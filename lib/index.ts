import * as restify from 'restify';
import { Server } from '@seatbelt/core/lib/server';
import { Log } from '@seatbelt/core';

export interface IServerConfig {
  port?: number;
}

@Server.Register()
export class RestifyServer implements Server.BaseServer {
  public log: Log = new Log('RestifyServer');
  public server: restify.Server = restify.createServer();
  public port: number = process.env.port || 3000;

  public constructor(config?: IServerConfig) {
    if (config) {
      if (config.port && typeof config.port === 'number') {
        this.port = config.port;
      }
    }
  }

  public conformServerControllerToSeatbeltController: Function = function (route: Server.Route, req: restify.Request, res: restify.Response) {

    const seatbeltResponse: Server.Response = {
      send: (status: number, body: Object) => {
        res.status(status);
        return res.send(body);
      }
    };

    const seatbeltRequest: Server.Request = {
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

  public config: Server.Config = function(routes: Server.Route[]) {
    this.server.use(restify.bodyParser());
    this.server.use(restify.queryParser());

    if (routes && Array.isArray(routes)) {
      routes.forEach((route: Server.Route) => {
        route['__seatbeltConfig'].type.forEach((eachType: string) => {
          route['__seatbeltConfig'].path.forEach((eachPath: string) => {
            this.server[eachType.toLowerCase()](eachPath, (req: restify.Request, res: restify.Response) => this.conformServerControllerToSeatbeltController(route, req, res));
          });
        });
      });
    }
  };

  public init: Server.Init = function () {
    this.log.system(`starting server on ${this.port}`);
    this.server.listen(this.port);
  };
}
