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
        this.router.post(`${this.path}`, auth, this.postIniciarConversa);
    }

    private async getAllConversas(req: Request, res: Response): Promise<any> {
        const converas = await conversasModel.find({ membros: req.userId });
        return res.status(200).json({ converas });
    }

    private async postIniciarConversa(
        req: Request,
        res: Response,
    ): Promise<any> {
        const loginUser = z.object({
            nome_chat: string(),
            membros: z.array(z.string()),
        });

        const { nome_chat, membros } = loginUser.parse(req.body);
        membros.push(req.userId);

        const converas = await conversasModel.create({
            nomeChat: nome_chat,
            membros: membros,
        });
        console.log('');
        return res.status(200).json({ converas });
    }
}
export default ConversasController;
