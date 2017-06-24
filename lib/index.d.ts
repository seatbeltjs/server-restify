import * as restify from 'restify';
import { Log } from '@seatbelt/core';
export declare class RestifyServer {
    log: Log;
    server: restify.Server;
    port: number;
    conformServerControllerToSeatbeltController: Function;
    config: Function;
    init: Function;
}
export declare const server: RestifyServer;
