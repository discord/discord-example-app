export function isTestEnvironment() {
    return process.env.NODE_ENV === 'test' ||
      process.env.MOCHA_RUNNING === 'true';
}

export function listAll() {
  return Object.entries(process.env).map(([key, value]) => `${key}=${value}`);
}