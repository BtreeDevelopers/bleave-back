import Conversas from '@/utils/interfaces/conversasInterface';
import { Schema, model } from 'mongoose';

const ConversasSchema = new Schema(
    {
        nomeChat: { type: String, require: false },
        membros: {
            type: [
                {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                    require: true,
                },
            ],
            require: true,
        },
        mensagens: {
            type: [
                Object({
                    id: { type: String, require: true },
                    idSender: {
                        type: Schema.Types.ObjectId,
                        ref: 'User',
                        require: true,
                    },
                    timestamps: { type: Date, require: true },
                    texto: { type: String, require: true },
                    enviados: { type: [String], require: false },
                }),
            ],
            require: false,
        },
    },
    { timestamps: true },
);

export default model<Conversas>('Conversas', ConversasSchema);
