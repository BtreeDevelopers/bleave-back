import { Document } from 'mongoose';
import { string } from 'zod';

interface Conversas extends Document {
    nomeChat: string;
    membros: Array<string>;
    mensagens: Array<{
        id: string;
        idSender: string;
        timestamps: Date;
        texto: string;
        enviados: Array<string>;
    }>;
}

export default Conversas;
