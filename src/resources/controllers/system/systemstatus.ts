import Controller from '@/utils/interfaces/controllerInterface';
import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

class SystemStatusController implements Controller {
    path = '/system';
    router: Router;
    constructor() {
        this.router = Router();
    }
    public async initialiseRoutes(): Promise<void> {
        this.router.get(`${this.path}`, this.systemStatus);
    }
    public async systemStatus(req: Request, res: Response): Promise<any> {
        return res.status(201).json({
            data: {
                srvStatus: 'running',
                dbState: mongoose.STATES[mongoose.connection.readyState],
            },
        });
    }
}

export default SystemStatusController;
