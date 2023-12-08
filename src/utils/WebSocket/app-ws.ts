import WebSocket from 'ws';
import querystring from 'node:querystring';
import loggedModel from '@/resources/models/loggedModel';

class SocketFactory {
    public wss: any;

    public static instance: SocketFactory;

    constructor(server: any) {
        if (!!SocketFactory.instance) {
            return SocketFactory.instance;
        }
        SocketFactory.instance = this;
        this.wss = new WebSocket.Server({ noServer: true }); // server: server
        return this;
    }

    public onError(): void {
        SocketFactory.instance.wss.on('error', console.error);
    }

    public onMessage(ws: any, data: any): void {
        console.log(`onMessage: ${data}`);
        ws.send(`recebido!`);
    }

    public onConnection(): void {
        SocketFactory.instance.wss.on(
            'connection',
            async (ws: any, req: any) => {
                //console.log(querystring.parse(req.url.replace('/', '')));
                let carry = req.url.replace('/', '');
                carry = carry.replace('?', '');
                const carryParams = querystring.parse(carry);

                const bearer = carryParams.bearer as string;
                const userid = carryParams.userid as string;

                const autorz = await loggedModel.findOne({
                    csfr: bearer,
                    userid: userid,
                });

                ws.id = autorz?.wsid; //Math.floor(Math.random() * Date.now() * 100000); //

                function welcome(ip: string, id: string): string {
                    let m = {
                        message: 'Welcome New Client!',
                        id: id,
                        ip: ip,
                    };
                    return JSON.stringify(m);
                }
                ws.send(
                    welcome(req.socket.remoteAddress, ws.id),
                    req.socket.remoteAddress,
                );

                ws.on('message', (message: any) => {
                    const clients = SocketFactory.instance.wss.clients;
                    let dat = JSON.parse(message);
                    let op = {
                        sender_id: dat.sender_id,
                        reciver_id: dat.reciver_id,
                        message: dat.message,
                    };

                    // salvo a mensagem no banco
                    // let user[] = getlist of recivers if conversaID = dat.conversID

                    clients.forEach(function each(client: any) {
                        if (
                            client !== ws &&
                            client.readyState === WebSocket.OPEN
                        ) {
                            //client.id in user[]
                            if (client.id == op.reciver_id) {
                                client.send(JSON.stringify(op));
                            }
                        }
                    });
                });
            },
        );
    }
}

export default SocketFactory;
