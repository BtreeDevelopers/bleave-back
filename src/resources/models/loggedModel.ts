import Logged from '@/utils/interfaces/loggedInterface';
import { Schema, model } from 'mongoose';

const LoggedSchema = new Schema(
    {
        csfr: { type: String, require: true },
        ip: { type: String, require: true },
        userid: { type: String, require: true },
        wsid: { type: String, require: true },
    },
    { timestamps: true },
);

export default model<Logged>('Logged', LoggedSchema);
