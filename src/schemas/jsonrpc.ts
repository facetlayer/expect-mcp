import { z } from 'zod';

export const JSONRPC_VERSION = '2.0';
export const LATEST_PROTOCOL_VERSION = '2025-06-18';

export const RequestIdSchema = z.union([z.string(), z.number()]);

export const ProgressTokenSchema = z.union([z.string(), z.number()]);

export const CursorSchema = z.string();

export const MetaSchema = z.record(z.unknown()).optional();

export const BaseRequestSchema = z.object({
  method: z.string(),
  params: z.object({
    _meta: z.object({
      progressToken: ProgressTokenSchema.optional(),
    }).passthrough().optional(),
  }).passthrough().optional(),
});

export const BaseNotificationSchema = z.object({
  method: z.string(),
  params: z.object({
    _meta: z.record(z.unknown()).optional(),
  }).passthrough().optional(),
});

export const BaseResultSchema = z.object({
  _meta: z.record(z.unknown()).optional(),
}).passthrough();

export const JSONRPCRequestSchema = BaseRequestSchema.extend({
  jsonrpc: z.literal(JSONRPC_VERSION),
  id: RequestIdSchema,
});

export const JSONRPCNotificationSchema = BaseNotificationSchema.extend({
  jsonrpc: z.literal(JSONRPC_VERSION),
});

export const JSONRPCResponseSchema = z.object({
  jsonrpc: z.literal(JSONRPC_VERSION),
  id: RequestIdSchema,
  result: BaseResultSchema,
});

export const JSONRPCErrorSchema = z.object({
  jsonrpc: z.literal(JSONRPC_VERSION),
  id: RequestIdSchema,
  error: z.object({
    code: z.number(),
    message: z.string(),
    data: z.unknown().optional(),
  }),
});

export const JSONRPCMessageSchema = z.union([
  JSONRPCRequestSchema,
  JSONRPCNotificationSchema,
  JSONRPCResponseSchema,
  JSONRPCErrorSchema,
]);

export const EmptyResultSchema = BaseResultSchema;

export type RequestId = z.infer<typeof RequestIdSchema>;
export type ProgressToken = z.infer<typeof ProgressTokenSchema>;
export type Cursor = z.infer<typeof CursorSchema>;
export type JSONRPCMessage = z.infer<typeof JSONRPCMessageSchema>;
export type JSONRPCRequest = z.infer<typeof JSONRPCRequestSchema>;
export type JSONRPCNotification = z.infer<typeof JSONRPCNotificationSchema>;
export type JSONRPCResponse = z.infer<typeof JSONRPCResponseSchema>;
export type JSONRPCError = z.infer<typeof JSONRPCErrorSchema>;
export type EmptyResult = z.infer<typeof EmptyResultSchema>;