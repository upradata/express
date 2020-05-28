import { NextFunction, Request, Response } from 'express';

export function logRequest(req: Request, res: Response, next: NextFunction) {
    if (req.method.toLocaleUpperCase() !== 'OPTIONS')
        console.log({ originalUrl: req.originalUrl, body: req.body });

    next();
}
