import cors from 'cors';
import express from 'express';
import { CodifiedError } from '@upradata/util';
import { corsOptions } from '../common';
import { EmailCodifiedError, EmailError } from './email-error';
import { createSendMail, SendMailOptions } from './send';
import { EmailOptions } from './types';


interface SendMailPostMethodOptions {
    app: express.Express;
    domain: string | RegExp;
    emailServiceOptions: SendMailOptions;
    url?: string;
}

export const createSendMailPostMethod = (options: SendMailPostMethodOptions) => {
    const { app, domain, emailServiceOptions, url = '/sendmail' } = options;

    const sendMail = createSendMail(emailServiceOptions);

    app.options(url, cors(corsOptions(domain))); // enable pre-flight request
    app.post(url, (req, res, next) => {
        const emailOptions: EmailOptions = req.body;

        return sendMail(emailOptions).then(() => {
            res.status(200).send({ message: 'Email sent' });
        }).catch((err: EmailError | Error) => {

            if (err instanceof EmailCodifiedError) {
                res.status(400).send(err.copy(k => k !== 'stack')); // 400 Bad Request

            } else if (Array.isArray(err) && err[ 0 ] && err[ 0 ] instanceof EmailCodifiedError) {
                if (err.length === 1)
                    res.status(400).send(err[ 0 ].copy(k => k !== 'stack')); // 400 Bad Request
                else
                    res.status(400).send({ code: 'list', name: 'Multi Errors', message: 'list of errors', list: err.map(e => e.copy(k => k !== 'stack')) } as CodifiedError<any>); // 400 Bad Request

            } else {
                res.status(500).send(err);
            }
        });
    });

    return sendMail;
};
