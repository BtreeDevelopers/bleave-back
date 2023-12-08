import { Document } from 'mongoose';

interface Logged extends Document {
    csfr: string;
    ip: string;
    userid: string;
    wsid: string;
}

export default Logged;
