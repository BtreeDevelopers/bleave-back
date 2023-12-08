import Contatos from '@/utils/interfaces/contatosInterface';
import { Schema, model } from 'mongoose';

const ContatosSchema = new Schema(
    {
        userId: { type: String, require: true },
        contatos: { type: [String], require: true },
    },
    { timestamps: true },
);

export default model<Contatos>('Contatos', ContatosSchema);
