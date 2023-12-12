import auth from '@/middleware/auth.middleware';
import conversasModel from '@/resources/models/conversasModel';
import Controller from '@/utils/interfaces/controllerInterface';
import { Router, Request, Response } from 'express';
import z, { string } from 'zod';

class ConversasController implements Controller {
    public path = '/conversas';
    public router: Router;

    constructor() {
        this.router = Router();
    }

    public async initialiseRoutes(): Promise<void> {
        this.router.get(`${this.path}`, auth, this.getAllConversas);
        this.router.get(`${this.path}/id/:id`, auth, this.getConversasFromId);
        this.router.post(`${this.path}`, auth, this.postIniciarConversa);
    }

    private async getAllConversas(req: Request, res: Response): Promise<any> {
        const conversas = await conversasModel
            .find({ membros: req.userId })
            .sort({ 'mensagens.timestamps': -1 });
        return res.status(200).json({ conversas });
    }
    private async getConversasFromId(
        req: Request,
        res: Response,
    ): Promise<any> {
        if (!req.params.id || req.params.id === '') {
            return res.status(500).json({ message: 'Missing Params' });
        }

        const conversas = await conversasModel
            .find({
                $and: [{ membros: req.userId }, { _id: req.params.id }],
            })
            .sort({ 'mensagens.timestamps': -1 });

        return res.status(200).json({ conversas });
    }

    private async postIniciarConversa(
        req: Request,
        res: Response,
    ): Promise<any> {
        const loginUser = z.object({
            nome_chat: string().optional(),
            membros: z.array(z.string()),
        });

        const { nome_chat, membros } = loginUser.parse(req.body);
        membros.push(req.userId);

        const conversas = await conversasModel.create({
            nomeChat: nome_chat,
            membros: membros,
        });
        console.log('');
        return res.status(200).json({ conversas });
    }
}
export default ConversasController;
