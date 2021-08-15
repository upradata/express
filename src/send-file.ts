
import { NextFunction, Response } from 'express';
// import * as core from 'express-serve-static-core';
import { ObjectOf, TT } from '@upradata/util';


export class SendFileOptions {

    // req: Request<core.ParamsDictionary, any, any, core.Query>;
    res: Response<any>;
    next: NextFunction;
    // Root directory for relative filenames
    root?: string = undefined;
    // 	Sets the max-age property of the Cache-Control header in milliseconds or a string in ms forma
    maxAge?: number = 0;
    // Sets the Last - Modified header to the last modified date of the file on the OS.Set false to disable it.
    lastModified?: undefined;
    // Object containing HTTP headers to serve with the file.
    headers?: ObjectOf<any> = {
        'x-timestamp': Date.now(),
        'x-sent': true
    };
    // Option for serving dotfiles.Possible values are “allow', “deny', “ignore'.“ignore'
    dotfile?: 'allow' | 'deny' | 'ignore' = 'ignore';
    // Enable or disable accepting ranged requests
    acceptRanges?: boolean = true;
    // Enable or disable setting Cache - Control response header
    cacheControlSetting?: TT<string | '1y', 'mutable'> = undefined;
    cacheControl?: boolean = true;
    // Enable or disable the immutable directive in the Cache - Control response heade
    // If enabled, the maxAge option should also be specified to enable caching.
    // The immutable directive will prevent supported clients from making conditional requests during the life of the maxAge option to check if the file has changed.
    immutable?: boolean = false;
}

export const sendFile = (filepath: string, options: SendFileOptions) => {
    const { res, next, cacheControlSetting } = options;

    const opts = {
        ...new SendFileOptions(),
        ...options
    };

    if (filepath === undefined) {
        next(new Error(`${filepath} not found.`));
        return;
    }

    if (cacheControlSetting) {
        if (cacheControlSetting === '1y')
            res.set('Cache-Control', 'public, max-age=31536000'); // 1 year because it's hashed ('cached busting')
        else
            res.set('Cache-Control', cacheControlSetting);
    }

    res.sendFile(filepath, opts, err => {
        if (err)
            next(err);
        else
            console.log('File sent:', filepath);
    });
};
