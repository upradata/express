
import { CodifiedError } from '@upradata/util';


export enum EmailErrors {
    MISSING_PARAMETER = 'upradata-error/missing-parameter',
    WRONG_FORMAT = 'upradata-error/wrong-format',
    SENDMAIL = 'upradata-error/sendmail-error',
    MAILGUN = 'upradata-error/mailgun-error',
    SENDGRID = 'upradata-error/sendgrid-error'
}


export class EmailCodifiedError extends CodifiedError<EmailErrors>{ }
export type EmailError = EmailCodifiedError | EmailCodifiedError[];
