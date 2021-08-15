import { NextFunction, Request, RequestHandler, Response } from 'express';
import { stringToRegex } from '@upradata/util';


export function makeFirewallMiddleware(allowedDomains: (string | RegExp)[]): RequestHandler {
    return function firewall(req: Request, res: Response, next: NextFunction) {

        const foundDomain = allowedDomains.map(d => stringToRegex(d)).find(domain => domain.test(req.hostname.toLowerCase()));

        if (!foundDomain) {
            res.status(403).send('Sorry, you are not allowed to access the server!');
            console.warn(`Forbidden request: ${req.protocol} => ${req.hostname}${req.originalUrl}`);
            return;
        }

        next();
    };
}
