import { NextFunction, Request, Response } from 'express';
import { disableTTYStylesIfNotSupported, red, yellow } from '@upradata/node-util';

disableTTYStylesIfNotSupported();

export function logError(err: Error, req: Request, res: Response, next: NextFunction) {
    console.error(yellow`❌ Error ${err.name}: "${err.message}"`);
    console.error(red`ᐅ stack: ${err.stack}`);

    next(err);
}

export function clientErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    if (req.xhr) {
        res.status(500).send({ error: 'Something failed!' });
    } else {
        next(err);
    }
}

export function catchAllErrorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    /*
    https://expressjs.com/en/guide/error-handling.html

    If you call next() with an error after you have started writing the response
    (for example, if you encounter an error while streaming the response to the client) the Express default error handler closes the connection and fails the request.

    So when you add a custom error handler, you must delegate to the default Express error handler, when the headers have already been sent to the client:
    */
    if (res.headersSent) {
        return next(err);
    }

    res.sendStatus(500);
    // res.status(500);
    // res.render('error', { error: err });
}


export const errorHandler = [ logError, clientErrorHandler, catchAllErrorHandler ];
