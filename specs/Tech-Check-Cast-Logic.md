# Type Checking and Casting System

## Overview

The expect-mcp library uses a runtime type checking and casting system to safely verify and cast values to specific class types. This system is designed to work reliably across different module boundaries and test framework contexts (Vitest, Jest) where `instanceof` checks may fail.

## Core Concepts

### Static Marker Pattern

Each class that needs type checking includes a static marker property that identifies the class:

```typescript
export class ToolCallResult {
  static _isToolCallResult = true;
  // ... class implementation
}
```

The marker property follows the naming convention: `_is{ClassName}` (e.g., `_isToolCallResult`, `_isReadResourceResult`).

### Why Not `instanceof`?

The traditional `instanceof` operator can fail in these scenarios:
- Multiple class instances loaded from different module paths
- Class instances crossing Jest/Vitest isolated test contexts
- Bundler configurations that duplicate class definitions

The static marker pattern works reliably because it checks for a property on the constructor, which is preserved across these boundaries.

## Implementation Structure

### 1. Generic `checkCast` Function

Located in `src/utils.ts`, this is the core type checking function:

```typescript
export function checkCast<T>(
  received: unknown,
  markerProperty: string,
  expectedTypeName: string,
  utils: MatcherUtils
): CheckCastResult<T>
```

**Parameters:**
- `received`: The value to check and cast
- `markerProperty`: The static marker property name (e.g., `'_isToolCallResult'`)
- `expectedTypeName`: Human-readable type name for error messages (e.g., `'ToolCallResult'`)
- `utils`: Matcher utilities for formatting error messages

**Return Type:**
```typescript
type CheckCastResult<T> =
  | { ok: true; value: T }
  | { ok: false; result: { pass: false; message: () => string } }
```

**Algorithm:**
1. Check if `received` is truthy
2. Check if `received` is an object
3. Check if `received.constructor[markerProperty]` exists and is truthy
4. If all checks pass, return `{ ok: true, value: received as T }`
5. Otherwise, return an error result with a formatted message

### 2. Specific Helper Functions

For each result class, there's a specific helper function that wraps `checkCast`:

```typescript
export function checkCastToolCallResult(
  received: unknown,
  utils: MatcherUtils
): CheckCastResult<any> {
  return checkCast(received, '_isToolCallResult', 'ToolCallResult', utils);
}
```

These helper functions:
- Provide a simpler API for common type checks
- Encapsulate the marker property name and type name
- Can be easily imported and used in matchers

### 3. Result Classes

Each result class must include a static marker:

```typescript
export class ToolCallResult {
  static _isToolCallResult = true;
  // ... implementation
}

export class ReadResourceResult {
  static _isReadResourceResult = true;
  // ... implementation
}

export class GetPromptResult {
  static _isGetPromptResult = true;
  // ... implementation
}
```

## Usage in Matchers

Matchers use the checkCast system to validate their inputs:

```typescript
export async function toBeSuccessful(
  this: any,
  received: unknown
): Promise<MCPMatcherResult> {
  const utils = resolveUtils(this);

  // Check and cast the received value to ToolCallResult
  const castResult = checkCastToolCallResult(received, utils);

  if (!castResult.ok) {
    return castResult.result;
  }

  const result = castResult.value as ToolCallResult;
  // ... continue with matcher logic
}
```

**Pattern:**
1. Call `resolveUtils(this)` to get matcher utilities
2. Call the appropriate `checkCast*` function
3. Check if `castResult.ok` is false, and if so, return the error immediately
4. Otherwise, use `castResult.value` for the validated and cast value

## Adding New Types

To add type checking for a new class:

### Step 1: Add Static Marker to Class

```typescript
export class NewResultType {
  static _isNewResultType = true;
  // ... class implementation
}
```

### Step 2: Create Helper Function in `utils.ts`

```typescript
/**
 * Check and cast a value to NewResultType.
 *
 * @param received - The value to check and cast
 * @param utils - Matcher utilities for formatting error messages
 * @returns A result object indicating success/failure with the cast value or error message
 */
export function checkCastNewResultType(
  received: unknown,
  utils: MatcherUtils
): CheckCastResult<any> {
  return checkCast(received, '_isNewResultType', 'NewResultType', utils);
}
```

### Step 3: Use in Matchers

```typescript
export async function someNewMatcher(
  this: any,
  received: unknown
): Promise<MCPMatcherResult> {
  const utils = resolveUtils(this);

  const castResult = checkCastNewResultType(received, utils);

  if (!castResult.ok) {
    return castResult.result;
  }

  const result = castResult.value as NewResultType;
  // ... matcher logic
}
```

## Design Principles

1. **Separation of Concerns**: The generic `checkCast` function handles the core logic, while helper functions provide convenient APIs
2. **Consistent Error Messages**: All type check failures produce consistent, helpful error messages
3. **Type Safety**: TypeScript generics ensure proper type inference throughout
4. **DRY (Don't Repeat Yourself)**: Common checking logic is centralized in one place
5. **Extensibility**: New types can be added easily by following the established pattern

## Error Messages

When type checking fails, users see clear, helpful messages:

```
Expected <received value> to be a ToolCallResult instance
```

The `utils.printReceived()` function formats the received value appropriately for the test framework being used (Vitest or Jest).

## Testing Considerations

This system is designed to work reliably in test environments where:
- Tests run in isolated contexts
- Multiple versions of classes might be loaded
- Different bundling strategies are used
- Cross-module boundaries are common

The static marker pattern ensures that type checks work consistently across all these scenarios.
