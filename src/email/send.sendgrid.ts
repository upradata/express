import sendgridJs from '@sendgrid/mail';
import { EmailOptions } from './types';


export interface SendgridOptions {
    apiKey: string;
}

export const sendgrid = (options: SendgridOptions) => {
    sendgridJs.setApiKey(options.apiKey);

    return function send(options: EmailOptions): Promise<string> {
        return sendgridJs.send(options as sendgridJs.MailDataRequired).then(res => {
            const { body, headers, statusCode } = res[ 0 ];
            return `{ statusCode: ${statusCode}, body: ${body} }`;
        });
    };
};
