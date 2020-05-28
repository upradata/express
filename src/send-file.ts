import { Request, Response, NextFunction } from 'express';
import * as core from 'express-serve-static-core';

export interface SendFileOptions {
    root: string;
    req: Request<core.ParamsDictionary, any, any, core.Query>;
    res: Response<any>;
    next: NextFunction;
    cacheControl?: string | '1y';
}

export const sendFile = (filepath: string, options: SendFileOptions) => {
    const { root, req, res, next, cacheControl } = options;

    const opts = {
        root,
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };

    if (filepath === undefined) {
        next(new Error(`${filepath} not found.`));
        return;
    }

    if (cacheControl) {
        if (cacheControl === '1y')
            res.set('Cache-Control', 'public, max-age=31536000'); // 1 year because it's hashed ('cached busting')
        else
            res.set('Cache-Control', cacheControl);
    }

    res.sendFile(filepath, options, err => {
        if (err)
            next(err);
        else
            console.log('File sent:', filepath);
    });
};
