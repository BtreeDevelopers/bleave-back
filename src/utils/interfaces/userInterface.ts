import { Document } from 'mongoose';

interface User extends Document {
    nome: string;
    email: string;
    imagemUrl: string;
}

export default User;
