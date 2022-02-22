import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
// Enable to use async/await and generators (using npm "co" package underneath) in the router's handlers
import 'express-async-errors';
import * as core from 'express-serve-static-core';
import * as qs from 'qs';
import serveStatic from 'serve-static';
import { AnyFunction, AssignOptions, assignRecursive, PartialRecursive } from '@upradata/util';
import { corsOptions, isDevelopment, isProduction } from './common';
import { EmailOptions, SendMail, SendMailOptions } from './email';
import { logRequest } from './middleware/common.middleware';
import { errorHandler } from './middleware/error.middleware';
import { makeFirewallMiddleware } from './middleware/firewall.middleware';
import { sendFile, SendFileOptions } from './send-file';


export interface StaticOptions {
    path: string;
    url: string;
    options: serveStatic.ServeStaticOptions;
}

export class ExpressServerOptions {
    domain: string | RegExp;
    allowedDomains: (string | RegExp)[] = [ /^localhost$/ ];
    enableLogRequest: boolean = isDevelopment;
    static?: StaticOptions = {
        path: 'static',
        url: '/static',
        options: { fallthrough: false, etag: true, index: 'index.html' }
    };
    bodyParser?: {
        urlencoded?: bodyParser.OptionsUrlencoded;
        json?: bodyParser.OptionsJson;
    } = {
            urlencoded: { extended: true },
            json: undefined
        };
    services: {
        sendmail?: {
            options: SendMailOptions;
            url?: string;
        };
    } = {};
}

export type ExpressServerOpts = PartialRecursive<Omit<ExpressServerOptions, 'static'> & { static: boolean | PartialRecursive<StaticOptions>; }>;

export class ExpressServer {
    public app: express.Express;
    public options: ExpressServerOptions;
    private sendMail: SendMail;

    constructor(options: ExpressServerOpts) {
        const defaultOpts = new ExpressServerOptions();

        this.options = assignRecursive({}, defaultOpts, options, new AssignOptions({
            arrayMode: 'replace',
            transform: (key, value) => {
                if (key === 'static')
                    return typeof options.static === 'boolean' ? defaultOpts.static : options.static ? value : undefined;

                return value;
            }
        }));

        if (!isProduction)
            this.options.domain = /.*/;

        this.app = express();
        this.create();
    }

    create() {
        const { enableLogRequest, domain, allowedDomains, static: staticOpts, services, bodyParser: bParser } = this.options;
        const { app } = this;

        app.use(cors(corsOptions(domain))); // all routes

        // support parsing of application/json type post data
        app.use(bodyParser.json(bParser.json));

        // support parsing of application/x-www-form-urlencoded for form data post request
        app.use(bodyParser.urlencoded(bParser.urlencoded));

        if (enableLogRequest)
            app.use(logRequest);

        if (allowedDomains.length > 0) {
            const isAllDomainsAllowed = allowedDomains.length === 1 && allowedDomains[ 0 ] === '*';

            if (!isAllDomainsAllowed)
                app.use(makeFirewallMiddleware(allowedDomains));
        }

        if (staticOpts)
            app.use(staticOpts.url, serveStatic(staticOpts.path, staticOpts.options));

        if (services.sendmail) {
            const { createSendMailPostMethod } = require('./email/email-post') as typeof import('./email/email-post');
            this.sendMail = createSendMailPostMethod({ app, domain, emailServiceOptions: services.sendmail.options, url: services.sendmail.url });
        }

        return this;
    }


    startListen(options: { port?: number; errorMiddleware?: boolean; } = {}) {
        const { app } = this;

        if (options.errorMiddleware)
            app.use(errorHandler);

        const port = process.env.PORT || options.port || 8080;

        // server
        return app.listen(port, ((err: Error) => {
            if (err) {
                console.error(err);
                process.exit(1);
            }

            console.log(`App listening on port ${port}`);
            console.log('Press Ctrl+C to quit.');

        }) as AnyFunction);
    }

    addCors(url: core.PathParams) {
        this.app.options(url, cors(corsOptions(this.options.domain))); // enable pre-flight request
    }

    method<P extends core.Params = core.ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = qs.ParsedQs>(
        method: 'all' | 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head',
        path: core.PathParams,
        ...handlers: Array<core.RequestHandler<P, ResBody, ReqBody, ReqQuery>> | Array<core.RequestHandlerParams<P, ResBody, ReqBody, ReqQuery>>) {

        // https://expressjs.com/en/resources/middleware/cors.html
        this.addCors(path);
        this.app[ method ](path, cors(corsOptions(this.options.domain)) as any as core.RequestHandler<P, ResBody, ReqBody, ReqQuery>, ...handlers);

        return this;
    }

    get<P extends core.Params = core.ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = qs.ParsedQs>(
        path: core.PathParams,
        ...handlers: Array<core.RequestHandler<P, ResBody, ReqBody, ReqQuery>> | Array<core.RequestHandlerParams<P, ResBody, ReqBody, ReqQuery>>) {

        return this.method('get', path, ...handlers);
    }

    set<P extends core.Params = core.ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = qs.ParsedQs>(
        path: core.PathParams,
        ...handlers: Array<core.RequestHandler<P, ResBody, ReqBody, ReqQuery>> | Array<core.RequestHandlerParams<P, ResBody, ReqBody, ReqQuery>>) {

        return this.method('post', path, ...handlers);
    }

    sendFile(filepath: string, options: SendFileOptions) {
        sendFile(filepath, options);
    }

    sendEmail(emailOptions: EmailOptions) {
        if (this.sendMail)
            this.sendMail(emailOptions);
        else {
            console.warn('Sendmail service has not been enabled during ExpressServer construction in the options');
        }
    }
}



/* app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // , Authorization

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // , Authorization
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
        return res.status(200).json({});
    }

    next();
}); */
