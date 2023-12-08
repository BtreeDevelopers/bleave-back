import 'dotenv/config';
import 'module-alias/register';
import App from './app';
import querystring from 'node:querystring';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import SocketFactory from './utils/WebSocket/app-ws';
import SystemStatusController from './resources/controllers/system/systemstatus';
import LoginController from './resources/controllers/login/loginController';
import accessModel from './resources/models/accessModel';
import { descriptografar } from './utils/encript/encript';
import loggedModel from './resources/models/loggedModel';

const systemController = new SystemStatusController();
const loginController = new LoginController();

systemController.initialiseRoutes();
loginController.initialiseRoutes();

const app = new App(
    [systemController, loginController],
    process.env.PORT as any,
);

app.start();

app.listen(false);

const server = require('http').createServer(app.express);
const sf = new SocketFactory(server);
sf.onConnection();
sf.onError();

server.on(
    'upgrade',
    async function upgrade(request: any, socket: any, head: any) {
        let carry = request.url.replace('/', '');
        carry = carry.replace('?', '');
        const carryParams = querystring.parse(carry);

        const csfr = carryParams.csfr as string;
        const userid = carryParams.userid as string;

        const csrfMon = await accessModel.findOneAndDelete({
            csfr: csfr,
        });

        const csrfDecriptografa = descriptografar({
            encryptedData: csrfMon?.app,
            iv: csrfMon?.iv,
        });

        if (
            !csrfMon ||
            csrfMon.expireAt < new Date().toISOString() ||
            userid !== csrfDecriptografa
        ) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
        } else {
            //req.socket.remoteAddress
            const autorz = await loggedModel.create({
                csfr: csfr,
                ip: request.socket.remoteAddress,
                userid: userid,
                wsid: uuidv4(),
            });
            sf.wss.handleUpgrade(request, socket, head, function done(ws: any) {
                sf.wss.emit('connection', ws, request);
            });
        }

        // if (bearer === userid) {
        //     sf.wss.handleUpgrade(request, socket, head, function done(ws: any) {
        //         sf.wss.emit('connection', ws, request);
        //     });
        // } else {
        //     socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        //     socket.destroy();
        // }
    },
);
server.listen(process.env.PORT, () =>
    console.log(`WebSocket running on port :${process.env.PORT}`),
);
