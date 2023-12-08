import WebSocket from 'ws';
import querystring from 'node:querystring';
import loggedModel from '@/resources/models/loggedModel';
import conversasModel from '@/resources/models/conversasModel';

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
                    };
                    return JSON.stringify(m);
                }
                ws.send(
                    welcome(req.socket.remoteAddress, ws.id),
                    req.socket.remoteAddress,
                );

                ws.on('message', async (message: any) => {
                    const clients = SocketFactory.instance.wss.clients;
                    let messageFromUser = JSON.parse(message);
                    let op = {
                        idConversa: messageFromUser.idConversa,
                        idSender: messageFromUser.idSender,
                        texto: messageFromUser.texto,
                        timestamps: Date.now(),
                    };
                    // salvo a mensagem no banco
                    const conversaUpdate = await conversasModel.updateOne(
                        { _id: op.idConversa },
                        { $push: { mensagens: op } },
                    );

                    // let user[] = getlist of recivers if conversaID = dat.conversID
                    const conversa = await conversasModel.findOne({
                        _id: op.idConversa,
                    });

                    const membros = conversa?.membros;

                    clients.forEach(function each(client: any) {
                        if (
                            client !== ws &&
                            client.readyState === WebSocket.OPEN
                        ) {
                            //client.id in user[]
                            membros?.forEach((element) => {
                                if (client.id == element) {
                                    client.send(JSON.stringify(op));
                                }
                            });
                        }
                    });
                });
            },
        );
    }
}

export default SocketFactory;
