import {config} from 'dotenv';
import {writeFile} from 'fs-extra';
import fetch from 'node-fetch';
import {resolve} from 'path';

// @ts-ignore
import swagger2openapi from 'swagger2openapi';

config();

(async () => {
    const {TEST_DOMAIN, TEST_API_KEY} = process.env;

    if (!TEST_DOMAIN || !TEST_API_KEY) {
        throw new Error(`Missing TEST_DOMAIN / TEST_API_KEY.`);
    }

    console.log(`[i] Fetching swagger.json from ${TEST_DOMAIN}`);

    // Fetch swagger json file
    const response = await fetch(`https://${TEST_DOMAIN}/webapp/api/v1/meta/swagger.json`, {
        headers: {
            'Accept': 'application/json',
            'AuthenticationToken': TEST_API_KEY
        }
    });

    const swagger = await response.json();
    if (!response.ok) {
        console.log(`[!] Failed to fetch swagger, status: ${response.status}`);
        console.log(JSON.stringify(swagger, null, 4));
        process.exit(1);
    }

    console.log(`[i] Convert to OpenAPIv3 format...`);

    // Convert to open-api format
    const openapi = await new Promise((resolve, reject) => {
        swagger2openapi.convertObj(swagger, {
            warnOnly: true,
            patch: true
        }, (err: any, options: any) => {
            if (err) {
                return reject(err);
            }

            resolve(options.openapi);
        });
    });

    console.log('[i] Write to disk...');

    // Write into current directory
    await writeFile(
        resolve(process.cwd(), 'openapi.json'),
        JSON.stringify(openapi, null, 2)
    );

    console.log('[✓] Done.');
})().catch(reason => {
    console.error('[!] Failed', reason);
    process.exit(1);
});


