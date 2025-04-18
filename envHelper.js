export function isTestEnvironment() {
    return process.env.NODE_ENV === 'test' ||
      process.env.MOCHA_RUNNING === 'true';
  }