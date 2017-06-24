import * as restify from 'restify';
import { DServerRegister, IServerRequest, IServerResponse, IServerRoute, Log } from '@seatbelt/core';

@DServerRegister()
export class RestifyServer {
  public log: Log = new Log('RestifyServer');
  public server: restify.Server = restify.createServer();
  public port: number = process.env.port || 3000;
  public conformServerControllerToSeatbeltController: Function = function (route: IServerRoute, req: restify.Request, res: restify.Response) {

    const seatbeltResponse: IServerResponse = {
      send: (status: number, body: any) => res.send(status, body)
    };

    const seatbeltRequest: IServerRequest = {
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
  public config: Function = function(routes: IServerRoute[]) {
    this.server.use(restify.bodyParser());
    this.server.use(restify.queryParser());

    if (routes && Array.isArray(routes)) {
      routes.forEach((route: IServerRoute) => {
        route['__seatbelt_config__'].type.forEach((eachType: string) => {
          route['__seatbelt_config__'].path.forEach((eachPath: string) => {
            this.server[eachType.toLowerCase()](eachPath, (req: restify.Request, res: restify.Response) => this.conformServerControllerToSeatbeltController(route, req, res));
          });
        });
      });
    }
  };
  public init: Function = function () {
    this.log.system(`starting server on ${this.port}`);
    this.server.listen(this.port);
  };
}

export const server: RestifyServer = new RestifyServer();
