import {generateInlineComment} from '@ts/generateComment';

export const CONSTANTS = Object.freeze({
    PLACEHOLDER_MISSING_TYPE: `any ${generateInlineComment('warning: cannot resolve type')}`,
    EMPTY_OBJECT_TYPE: `any ${generateInlineComment('warning: found {} empty object')}`
});
