import { Document } from 'mongoose';

interface Contatos extends Document {
    userId: string;
    contatos: Array<string>;
}

export default Contatos;
