import * as restify from 'restify';
import { Server } from '@seatbelt/core/lib/server';
import { Log } from '@seatbelt/core';
export interface IServerConfig {
    port?: number;
}
export declare class RestifyServer implements Server.BaseServer {
    log: Log;
    server: restify.Server;
    port: number;
    constructor(config?: IServerConfig);
    conformServerControllerToSeatbeltController: Function;
    config: Server.Config;
    init: Server.Init;
}
