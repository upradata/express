import sendgridJs from '@sendgrid/mail';
import { EmailOptions } from './types';


export interface SendgridOptions {
    apiKey: string;
}

export const sendgrid = (options: SendgridOptions) => {
    sendgridJs.setApiKey(options.apiKey);

    const send = async (options: EmailOptions): Promise<string> => {
        const res = await sendgridJs.send(options as sendgridJs.MailDataRequired);
        const { body, headers, statusCode } = res[ 0 ];
        return `{ statusCode: ${statusCode}, body: ${body} }`;
    };

    return send;
};
