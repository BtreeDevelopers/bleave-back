import express, { Application } from 'express';
import Controller from './utils/interfaces/controllerInterface';
import helmet, { contentSecurityPolicy } from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';

class App {
    public express: Application;
    public port: Number;
    public controllers: Controller[];

    constructor(controllers: Controller[], port: Number) {
        this.express = express();
        this.port = port;
        this.controllers = controllers;
    }

    public listen(listening = false): void {
        if (listening) {
            this.express.listen(this.port, () => {
                console.log(`Listening on port ${this.port}`);
            });
        }

        this.express.all('*', (req, res) => {
            res.status(404).send({ message: 'Not Found.' });
        });
    }

    public start(): void {
        this.initialiseMiddleware();
        this.initialiseControllers(this.controllers);
        //this.initialiseDatabaseConnection();
    }

    private initialiseMiddleware(): void {
        this.express.use(helmet());
        this.express.use(
            helmet.contentSecurityPolicy({
                useDefaults: false,
            }),
        );
        this.express.use(cors());
        this.express.use(morgan('dev'));
        this.express.use(express.json());
        this.express.use(express.urlencoded({ extended: false }));
    }

    private initialiseControllers(controller: Controller[]): void {
        controller.forEach((controller: Controller) => {
            console.log(controller.path);
            this.express.use('/api', controller.router);
        });
    }

    private initialiseDatabaseConnection(): void {
        const { MONGO_USER, MONGO_PASSWORD, MONGO_PATH } = process.env;
        if (MONGO_USER !== '' && MONGO_PASSWORD !== '' && MONGO_PATH) {
            mongoose
                .connect(`${MONGO_PATH}`, {
                    auth: {
                        password: MONGO_PASSWORD,
                        username: MONGO_USER,
                    },
                    authSource: 'admin',
                })
                .then(() => {
                    console.log('logged');
                });
        } else {
            console.log({ MONGO_USER, MONGO_PASSWORD, MONGO_PATH });
        }
    }
}

export default App;
