export enum Target {
    BROWSER_PROMISES,
    BROWSER_RX,
    NODE_PROMISES,
    NODE_RX
}

/**
 * Returns true whenever the given target is for node
 * @param target
 */
export const isNodeTarget = (target: Target): boolean => {
    return target === Target.NODE_PROMISES || target === Target.NODE_RX;
};

/**
 * Returns true whenever the given target is for RxJS
 * @param target
 */
export const isRXTarget = (target: Target): boolean => {
    return target === Target.BROWSER_RX || target === Target.NODE_RX;
};

interface FunctionGenerator {
    signature: string;
    returnType: string;
    returnValue: string,
}

/**
 * Generates a function with the given parmaters
 * @param target Current target
 * @param signature Function signature
 * @param returnType Return type of the function
 * @param returnValue Return value of the function
 */
export const generateFunction = (target: Target, {signature, returnType, returnValue}: FunctionGenerator): string => {
    return isRXTarget(target) ? `
${signature}: Observable<${returnType}> {
    return defer(() => ${returnValue});
}` : `
async ${signature}: Promise<${returnType}> {
    return ${returnValue};
}`;
};
