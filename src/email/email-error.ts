
import { CodifiedError } from '@upradata/util';


export enum EmailErrors {
    MISSING_PARAMETER = 'upradata-error/missing parameter',
    WRONG_FORMAT = 'upradata-error/wrong format',
    MAILGUN = 'upradata-error/mailgun error'
}


export class EmailCodifiedError extends CodifiedError<EmailErrors>{ }
export type EmailError = EmailCodifiedError | EmailCodifiedError[];
