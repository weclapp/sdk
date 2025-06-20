export enum Target {
  BROWSER_PROMISES = 'browser',
  BROWSER_RX = 'browser.rx',
  NODE_PROMISES = 'node',
  NODE_RX = 'node.rx'
}

export const isNodeTarget = (target: Target): boolean => {
  return target === Target.NODE_PROMISES || target === Target.NODE_RX;
};

export const isRXTarget = (target: Target): boolean => {
  return target === Target.BROWSER_RX || target === Target.NODE_RX;
};

export const resolveResponseType = (target: Target) => {
  return isRXTarget(target) ? 'Observable' : 'Promise';
};

export const resolveBinaryType = (target: Target) => {
  return isNodeTarget(target) ? 'Buffer' : 'Blob';
};
