import mailgunJs from 'mailgun-js';
import { EmailCodifiedError, EmailErrors, EmailError } from './email-error';
import { EMAIL_REGEXP } from '@upradata/util';


export interface EmailOptions {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

export type SendMail = (emailOptions: EmailOptions) => Promise<void>;

export const createSendMail = (mailgunOptions: mailgunJs.ConstructorParams): SendMail => {
    const mg = mailgunJs(mailgunOptions);

    return function sendMail(emailOptions: EmailOptions) {

        const errors: EmailError[] = [];
        const required = [ 'from', 'to', 'text' ];

        for (const param of required) {
            if (!emailOptions[ param ])
                errors.push(new EmailCodifiedError({ code: EmailErrors.MISSING_PARAMETER, message: `Missing "${param}" address parameter` }));
        }


        for (const param of [ 'from', 'to' ]) {
            const address = emailOptions[ param ];

            if (!EMAIL_REGEXP.test(address))
                errors.push(new EmailCodifiedError({ code: EmailErrors.WRONG_FORMAT, message: `Wrong email format for "${param}" address: ${address || 'not provided'}` }));
        }

        if (errors.length > 0)
            return Promise.reject(errors);

        const o = emailOptions;
        const mailDescription = `From: ${o.from} / To: ${o.to} with Subject: ${o.subject}`;

        return mg.messages().send(o).then(body => {
            console.warn(`Mail sent => ${mailDescription}`);
        }).catch(err => {
            console.warn(`Mail not sent: ${mailDescription}`);
            throw new EmailCodifiedError({ code: EmailErrors.MAILGUN, message: err.message || err });
        });
    };
};
