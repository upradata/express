import { Client } from '@sendgrid/client';
import { ClientRequest } from '@sendgrid/client/src/request';
import { EmailOptions } from './types';


export const sendgrid = (options?: ClientRequest & { apiKey: string; }) => {
    const client = new Client();
    client.setApiKey(options.apiKey);

    return function send(options: EmailOptions) {

        const request = client.createRequest({
            url: '/v3/mail/send',
            method: 'POST',
            body: {
                personalizations: [
                    {
                        to: [ { email: options.to } ],
                        subject: options.subject,
                    },
                ],
                from: { email: options.from },
                content: [
                    options.html && {
                        type: 'text/html',
                        value: options.html,
                    },
                    options.text && {
                        type: 'text/plain',
                        value: options.text,
                    },
                ].filter(v => !!v),
            }
        });

        return client.request(request);
    };
};
