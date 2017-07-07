import * as restify from 'restify';
import { ServerPlugin } from '@seatbelt/core/plugins';
export interface IServerConfig {
    port?: number;
}
export declare class RestifyServer implements ServerPlugin.BaseInterface {
    private log;
    server: restify.Server;
    port: number;
    constructor(config?: IServerConfig);
    conformServerControllerToSeatbeltController: Function;
    config: ServerPlugin.Config;
    init: ServerPlugin.Init;
}
