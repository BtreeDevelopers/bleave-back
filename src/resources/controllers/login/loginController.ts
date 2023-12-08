import Controller from '@/utils/interfaces/controllerInterface';

import { Router, Request, Response } from 'express';
import z, { string } from 'zod';
import { compare } from 'bcryptjs';
import mongoose from 'mongoose';
import generateToken from '@/utils/Auth/jwt.auth';
import { bauth } from '@/utils/bauth/bauth';
import { v4 as uuidv4 } from 'uuid';
import { criptografar } from '@/utils/encript/encript';
import accessModel from '@/resources/models/accessModel';

class LoginController implements Controller {
    public path = '/login';
    public router: Router;

    constructor() {
        this.router = Router();
    }

    public async initialiseRoutes(): Promise<void> {
        this.router.post(`${this.path}`, this.login);
        this.router.post(`${this.path}/csfr`, this.criarCSFR);
    }

    private async login(req: Request, res: Response): Promise<any> {
        try {
            const loginUser = z.object({
                token: string(),
                userId: string(),
            });

            const { token, userId } = loginUser.parse(req.body);

            bauth.defaults.headers.common = {
                Authorization: `bearer ${token}`,
            };

            const responseTokenUser = await bauth.get('/user');

            const user = responseTokenUser.data;

            if (user._id === userId) {
                const token_bjrd = generateToken({ id: userId });
                return res.status(200).json({
                    token_bjrd,
                    _id: user._id,
                    nome: user.nome,
                    email: user.email,
                    bauth_token: token,
                    imagemUrl: user.imagemUrl,
                });
            } else {
                return res.status(401).json({
                    message: 'Unable to create bauth',
                });
            }
        } catch (error: any) {
            if (error.message === 'Usuário ou senha incorretos') {
                return res
                    .status(401)
                    .json({ message: 'Usuário ou senha incorretos' });
            }
            console.log(error);
            return res.status(400).json({ error });
        }
    }
    private async criarCSFR(req: Request, res: Response): Promise<any> {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const bodydata = z.object({
                userId: string(),
            });

            const { userId } = bodydata.parse(req.body);

            const responseTokenUser = await bauth.get('/user');

            const user = responseTokenUser.data;

            if (user._id !== userId) {
                throw new Error('Param  error');
            }

            const keyToAccess = uuidv4();

            let expireAt = new Date();
            expireAt.setHours(expireAt.getHours() + 1);

            let criptogra = criptografar(userId);

            accessModel.create({
                csfr: keyToAccess,
                expireAt: expireAt.toISOString(),
                app: criptogra.encryptedData,
                iv: criptogra.iv,
            });

            await session.commitTransaction();
            return res.status(200).json({ csfr: keyToAccess });
        } catch (error: any) {
            console.log(error);
            await session.abortTransaction();
            return res.status(500).json({ message: 'Something went wrong' });
        } finally {
            await session.endSession();
        }
    }
}

export default LoginController;
