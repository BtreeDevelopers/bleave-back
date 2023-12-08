import User from '@/utils/interfaces/userInterface';
import { Schema, model } from 'mongoose';

const UserSchema = new Schema({
    nome: { type: String, require: true },
    email: { type: String, require: true },
    imagemUrl: { type: String, require: true },
});

export default model<User>('User', UserSchema);
