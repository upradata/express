import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { styles as s } from '@upradata/node-util';
import { ensureArray, ifChained, TT } from '@upradata/util';
import { isDevelopment } from './common';


const readdir = promisify(fs.readdir);

export type Filter = (options: { dirname: string; basename: string; filepath: string; }) => boolean;

export interface FoundFile {
    dirname: string;
    basename: string;
    filepath: string;

}

export interface FoundError {
    code: string;
    error: Error;
}

export type FoundFileWithError = FoundFile & Partial<FoundError>;


export interface FindFileOptions {
    dir: string;
    regex?: TT<RegExp, 'mutable'>;
    file?: string;
    filter?: Filter;
    errorOnNotUnique?: boolean;
}


export const findFile = async (options: FindFileOptions): Promise<FoundFileWithError> => {
    const { dir, file, regex, filter, errorOnNotUnique } = options;
    const regexes = ensureArray(regex);

    const selectStr = ifChained()
        .next({ if: !!filter, then: '"filter" function' })
        .next({ if: !!file, then: '' })
        .next({ if: !!regex, then: '' })
        .next({ then: '' })
        .value;

    filter ? '"filter" function' : file ?
        `File "${file}"` : regex ?
            `Regexes [ ${regexes.map(r => r.source).join(', ')} ]` :
            '';

    const { files, error, code } = await findFiles({ dir, regex });

    if (error)
        return { error, code } as FoundFileWithError;

    if (files.length === 0)
        return { code: 'find-files/not-found', error: new Error(`${selectStr} did not match any file in '${dir}'`) } as FoundFileWithError;

    if (files.length > 1) {
        if (errorOnNotUnique) {
            return {
                code: 'find-files/not-unique',
                error: new Error(`${selectStr} matched few files in "${dir}": files: [ ${files.join(',')} ]`)
            } as FoundFileWithError;

        }
        if (isDevelopment) {
            console.warn(s.magenta.args.yellow.stripIndent.full.$`
                    ${selectStr} matched few files in "${dir}": files =>

                    [
                        ${files.join('\n')}
                    ].

                    First one will be returned: "${files[ 0 ]}"`
            );
        }

    }

    return files[ 0 ];

    /* for (const r of regexes) {
        const foundFiles = files.filter(f => r.test(f.filepath));

        if (foundFiles.length > 1) {
            console.warn(
                yellow`${ regexesStr } matched few files in "${dir}": files: [ ${ foundFiles.join(',') } ].
                First one will be returned: "${foundFiles[ 0 ]}"`
            );

            return foundFiles[ 0 ];
        }
    } */
};

export interface FindFilesOptions {
    dir: string;
    filter: Filter;
}

export type FoundFilesWithError = { files: FoundFile[]; } & Partial<FoundError>;

export const findFiles = async (options: FindFileOptions): Promise<FoundFilesWithError> => {
    const { dir, filter, regex, file } = options;

    const regexes = ensureArray(regex);

    const select = filter || file ?
        (o => path.relative(o.dirname, o.filepath) === file) as Filter :
        (o => regexes.some(r => r.test(o.filepath))) as Filter;

    try {
        const files = await readdir(dir);
        return {
            files: files.map(f => ({ dirname: dir, basename: f, filepath: path.join(dir, f) })).filter(select)
        };

    } catch (e) {

        return { code: 'find-files/readdir', error: new Error(`Error while reading ${dir}: "${e.message || JSON.stringify(e)}"`) } as FoundFilesWithError;
    }
};
