import { NextFunction, Request, RequestHandler, Response } from 'express';
import { stringToRegex } from '@upradata/util';
import { disableTTYStylesIfNotSupported, styles as s } from '@upradata/node-util';

disableTTYStylesIfNotSupported();

export function makeFirewallMiddleware(allowedDomains: (string | RegExp)[]): RequestHandler {
    return function firewall(req: Request, res: Response, next: NextFunction) {

        const clientUrl = req.get('referer') || req.get('origin') || req.get('host').replace(/:.*/, '');
        const foundDomain = allowedDomains.map(d => stringToRegex(d)).find(domain => domain.test(clientUrl));

        if (!foundDomain) {
            res.status(403).send('Sorry, you are not allowed to access the server!');
            console.warn(s.bold.args.yellow.full.$`ᐅ Accesss denied for "${clientUrl}" (request ${req.protocol}:  ${req.hostname}${req.originalUrl})`);
            return;
        }

        next();
    };
}
