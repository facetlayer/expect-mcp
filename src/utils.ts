
export type MatcherUtils = typeof fallbackPrinter;

export type MatcherContext = {
  utils?: MatcherUtils;
};



export function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
  
  export function safeToString(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }
  
    try {
      return JSON.stringify(value, null, 2);
    } catch (error) {
      return String(value);
    }
  }

  export const fallbackPrinter = {
    printReceived: (value: unknown) => safeToString(value),
    printExpected: (value: unknown) => safeToString(value),
  };

  export function resolveUtils(ctx: unknown): MatcherUtils {
    const utils = (ctx as MatcherContext | undefined)?.utils;
    if (!utils) {
      return fallbackPrinter;
    }
  
    const hasPrinter =
      typeof utils.printReceived === 'function' && typeof utils.printExpected === 'function';
  
    return hasPrinter ? utils : fallbackPrinter;
  }