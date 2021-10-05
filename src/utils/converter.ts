import {OpenAPIV3} from 'openapi-types';

// @ts-ignore
import {convertObj} from 'swagger2openapi';

export const convertSwaggerToOpenAPI = async (doc: any): Promise<OpenAPIV3.Document> => {
    return new Promise((resolve, reject) => {
        convertObj(doc, {
            warnOnly: true,
            patch: true
        }, (err: any, options: any) => {
            if (err) {
                return reject(err);
            }

            resolve(options.openapi);
        });
    });
};
