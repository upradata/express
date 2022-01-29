import cors from 'cors';
import { regexToString } from '@upradata/util';


export const isProduction = process.env.NODE_ENV === 'production' ? true : false;
export const isDevelopment = !isProduction;

/* if (isProduction)
    require('@google-cloud/debug-agent').start({ allowExpressions: true }); */


const set = (...words: string[]) => `[${words.join()}]`;

const word = 'a-zA-Z0-9';
const level = `${set(word)}|${set(word)}${set(word, '\\-')}{0,1}${set(word)}`;


// https://stackoverflow.com/questions/106179/regular-expression-to-match-dns-hostname-or-ip-address
export const anySubdomainRegex = (domainRegex: string | RegExp) => new RegExp(`^(https?://)?(${level}\\.)*${regexToString(domainRegex)}$`);

export const origin = (domain: string | RegExp) => {
    if (isProduction)
        return new RegExp(`${regexToString(/https?:\/\/(\w*\.)*/)}${regexToString(domain)}`);

    return /.*/;
};


export const corsOptions = (domain: string | RegExp): cors.CorsOptions | cors.CorsOptionsDelegate => ({
    origin: [ origin(domain) ], // any sub-domain
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
});


/*
Create a .spec.ts file
console.log(anySubdomainRegex('caca.com').test('http://pipi.caca.com'));
console.log(anySubdomainRegex('caca.com').test('pipi.caca.com'));
console.log(anySubdomainRegex('caca.com').test('caca.com'));
console.log(anySubdomainRegex('caca.com').test('caca2.com'));
 */
