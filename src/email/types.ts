
export interface EmailOptions {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
}


export type SendMail = (emailOptions: EmailOptions) => Promise<void>;
