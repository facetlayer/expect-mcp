export type MatcherUtils = typeof fallbackPrinter;

export type MatcherContext = {
  utils?: MatcherUtils;
  isNot?: boolean;
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

export type CheckCastResult<T> =
  | { ok: true; value: T }
  | { ok: false; result: { pass: false; message: () => string } };

export type CheckMCPSubprocessResult<T> =
  | { ok: true; value: T; subprocess: T }
  | { ok: false; result: { pass: false; message: () => string } };

/**
 * Generic type checking/casting utility.
 *
 * This function checks if a received value is an instance of a specific class
 * by looking for a static marker property on the constructor.
 *
 * @param received - The value to check and cast
 * @param markerProperty - The static property name to check on the constructor (e.g., '_isToolCallResult')
 * @param expectedTypeName - The human-readable name of the expected type (e.g., 'ToolCallResult')
 * @param utils - Matcher utilities for formatting error messages
 * @returns A result object indicating success/failure with the cast value or error message
 */
export function checkCast<T>(
  received: unknown,
  markerProperty: string,
  expectedTypeName: string,
  utils: MatcherUtils
): CheckCastResult<T> {
  if (
    !received ||
    typeof received !== 'object' ||
    !(received.constructor as any)[markerProperty]
  ) {
    return {
      ok: false,
      result: {
        pass: false,
        message: () =>
          `Expected ${utils.printReceived(received)} to be a ${expectedTypeName} instance`,
      },
    };
  }

  return {
    ok: true,
    value: received as T,
  };
}

export function checkCastMCPStdinSubprocess<T>(
  received: unknown,
  utils: MatcherUtils
): CheckMCPSubprocessResult<T> {
  const result = checkCast<T>(received, '_isMCPStdinSubprocess', 'MCPStdinSubprocess', utils);

  if (!result.ok) {
    return result;
  }

  return {
    ok: true,
    value: result.value,
    subprocess: result.value,
  };
}

/**
 * Check and cast a value to ToolCallResult.
 *
 * @param received - The value to check and cast
 * @param utils - Matcher utilities for formatting error messages
 * @returns A result object indicating success/failure with the cast value or error message
 */
export function checkCastToolCallResult(
  received: unknown,
  utils: MatcherUtils
): CheckCastResult<any> {
  return checkCast(received, '_isToolCallResult', 'ToolCallResult', utils);
}

/**
 * Check and cast a value to ReadResourceResult.
 *
 * @param received - The value to check and cast
 * @param utils - Matcher utilities for formatting error messages
 * @returns A result object indicating success/failure with the cast value or error message
 */
export function checkCastReadResourceResult(
  received: unknown,
  utils: MatcherUtils
): CheckCastResult<any> {
  return checkCast(received, '_isReadResourceResult', 'ReadResourceResult', utils);
}

/**
 * Check and cast a value to GetPromptResult.
 *
 * @param received - The value to check and cast
 * @param utils - Matcher utilities for formatting error messages
 * @returns A result object indicating success/failure with the cast value or error message
 */
export function checkCastGetPromptResult(
  received: unknown,
  utils: MatcherUtils
): CheckCastResult<any> {
  return checkCast(received, '_isGetPromptResult', 'GetPromptResult', utils);
}
