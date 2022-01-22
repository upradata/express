import { isDefined } from '@upradata/util';
import { checkEmailArgs } from './common';
import { EmailCodifiedError, EmailErrors } from './email-error';
import { mailgun, MailgunOpts } from './send.mailgun';
import { sendgrid, SendgridOptions } from './send.sendgrid';
import { EmailOptions, SendMail } from './types';


export interface SendMailOptions {
    mailgun?: MailgunOpts;
    sendgrid?: SendgridOptions;
}

export const createSendMail = (options: SendMailOptions): SendMail => {

    const send = options.mailgun ? mailgun(options.mailgun) : options.sendgrid ? sendgrid(options.sendgrid) : undefined;

    if (!isDefined(send))
        throw new EmailCodifiedError({ code: EmailErrors.SENDMAIL, message: 'mailgun or sendgrid options has to be passed!' });


    return function sendMail(emailOptions: EmailOptions) {

        const errors = checkEmailArgs(emailOptions);
        if (errors)
            return Promise.reject(errors);

        const o = emailOptions;
        const mailDescription = `From: ${o.from} / To: ${o.to} with Subject: ${o.subject}`;

        return send(o).then(body => {
            console.warn(`Mail sent => ${mailDescription}`);
        }).catch(err => {
            console.warn(`Mail not sent: ${mailDescription}`);
            throw new EmailCodifiedError({ code: EmailErrors.MAILGUN, message: err.message || err });
        });
    };
};
