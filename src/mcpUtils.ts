import { MCPError, MCPResponse, MCPResult } from './types.js';

import { MCPContentMessage } from './types.js';
import { isPlainObject } from './utils.js';

export function isMCPError(value: unknown): value is MCPError {
  return (
    isPlainObject(value) && typeof value.code === 'number' && typeof value.message === 'string'
  );
}

function isMCPContentMessage(value: unknown): value is MCPContentMessage {
  return (
    isPlainObject(value) &&
    typeof value.role === 'string' &&
    typeof value.type === 'string' &&
    'content' in value
  );
}

function isMCPResult(value: unknown): value is MCPResult {
  if (!isPlainObject(value)) {
    return false;
  }

  if ('content' in value && value.content !== undefined) {
    if (!Array.isArray(value.content)) {
      return false;
    }

    return value.content.every(isMCPContentMessage);
  }

  return true;
}

export function isMCPResponse(value: unknown): value is MCPResponse {
  if (!isPlainObject(value)) {
    return false;
  }

  if (value.jsonrpc !== '2.0') {
    return false;
  }

  const { id, result, error } = value;

  const hasValidId = typeof id === 'string' || typeof id === 'number' || id === null;

  const hasResult = result !== undefined;
  const hasError = error !== undefined;

  if (!hasResult && !hasError) {
    return false;
  }

  const resultIsValid = !hasResult || isMCPResult(result);
  const errorIsValid = !hasError || isMCPError(error);

  return hasValidId && resultIsValid && errorIsValid;
}
