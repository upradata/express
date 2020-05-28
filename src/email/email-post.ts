import cors from 'cors';
import express from 'express';
import mailgunJs from 'mailgun-js';
import { createSendMail, EmailOptions } from './send.mailgun';
import { EmailError, EmailCodifiedError } from './email-error';
import { corsOptions } from '../common';
import { CodifiedError } from '@upradata/util';

interface SendMailPostMethodOptions {
    app: express.Express;
    domain: string | RegExp;
    mailgunOptions: mailgunJs.ConstructorParams;
    url?: string;
}

export const createSendMailPostMethod = (options: SendMailPostMethodOptions) => {
    const { app, domain, mailgunOptions, url = '/sendmail' } = options;

    const sendMail = createSendMail(mailgunOptions);

    app.options(url, cors(corsOptions(domain))); // enable pre-flight request
    app.post(url, (req, res, next) => {
        const mailData: EmailOptions = req.body;

        return sendMail(mailData).then(() => {
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
