/* eslint-disable */
import {OpenAPIV3} from 'openapi-types';

// @ts-ignore
import {convertObj} from 'swagger2openapi';

export const convertSwaggerToOpenAPI = async (doc: any): Promise<OpenAPIV3.Document> => {
    return new Promise((resolve, reject) => {
        convertObj(doc, {}, (err: any, result: any) => {
            return err ? reject(err) : resolve(result.openapi);
        });
    });
};
