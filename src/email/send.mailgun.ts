import Mailgun from 'mailgun.js';
import MailgunOptions from 'mailgun.js/lib/interfaces/Options';
import formData from 'form-data';
import { EmailOptions } from './types';

export type MailgunOpts = MailgunOptions & { domain: string; };

export const mailgun = (options: MailgunOpts) => {
    const mailgun = new Mailgun(formData);
    const mg = mailgun.client(options);

    const send = async (data: EmailOptions) => {
        type Res = { id: string; message: string; };
        const { id, message }: Res = await mg.messages.create(options.domain, data);

        return `{ id: ${id}, message: ${message} }`;
    };

    return send;
};
