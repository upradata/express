import { EMAIL_REGEXP } from '@upradata/util';
import { EmailCodifiedError, EmailError, EmailErrors } from './email-error';
import { EmailOptions } from './types';


export const checkEmailArgs = (emailOptions: EmailOptions) => {

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

    return errors.length === 0 ? undefined : errors;
};
