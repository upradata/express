import { NextFunction, Request, Response } from 'express';


export function logRequest(req: Request, res: Response, next: NextFunction) {
    if (req.method.toLocaleUpperCase() !== 'OPTIONS') {
        const type = typeof req.body;
        const body = type === 'string' ? req.body.slice(0, 100) : type === 'object' && Object.keys(req.body).length === 0 ? undefined : type;

        console.log({ originalUrl: req.originalUrl, body });
    }

    next();
}
