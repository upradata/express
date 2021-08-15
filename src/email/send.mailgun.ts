import mailgunJs from 'mailgun-js';
import { EmailOptions } from './types';


export const mailgun = (options: mailgunJs.ConstructorParams) => {
    const mg = mailgunJs(options);

    return function send(options: EmailOptions) {
        return mg.messages().send(options).then(res => `{ id: ${res.id}, message: ${res.message} }`);
    };
};
