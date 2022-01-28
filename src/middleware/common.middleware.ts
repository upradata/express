import { NextFunction, Request, Response } from 'express';
import { disableTTYStylesIfNotSupported, nice } from '@upradata/node-util';

disableTTYStylesIfNotSupported();

export function logRequest(req: Request, res: Response, next: NextFunction) {
    if (req.method.toLowerCase() !== 'options') {
        const type = typeof req.body;

        const getBody = () => {
            if (type === 'string')
                return `${req.body.slice(0, 100)}...`;

            if (type === 'object')
                return Object.keys(req.body).length === 0 ? undefined : type;

            return req.body;
        };

        console.log(nice({ originalUrl: req.originalUrl, body: getBody() }));
    }

    next();
}
