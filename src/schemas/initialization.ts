import { z } from 'zod';
import { BaseRequestSchema, BaseResultSchema, MetaSchema } from './jsonrpc.js';

export const BaseMetadataSchema = z.object({
  name: z.string(),
  title: z.string().optional(),
});

export const ImplementationSchema = BaseMetadataSchema.extend({
  version: z.string(),
});

export const ClientCapabilitiesSchema = z.object({
  experimental: z.record(z.object({})).optional(),
  roots: z.object({
    listChanged: z.boolean().optional(),
  }).optional(),
  sampling: z.object({}).optional(),
  elicitation: z.object({}).optional(),
});

export const ServerCapabilitiesSchema = z.object({
  experimental: z.record(z.object({})).optional(),
  logging: z.object({}).optional(),
  completions: z.object({}).optional(),
  prompts: z.object({
    listChanged: z.boolean().optional(),
  }).optional(),
  resources: z.object({
    subscribe: z.boolean().optional(),
    listChanged: z.boolean().optional(),
  }).optional(),
  tools: z.object({
    listChanged: z.boolean().optional(),
  }).optional(),
});

export const InitializeRequestSchema = BaseRequestSchema.merge(z.object({
  method: z.literal('initialize'),
  params: z.object({
    protocolVersion: z.string(),
    capabilities: ClientCapabilitiesSchema,
    clientInfo: ImplementationSchema,
    _meta: z.record(z.unknown()).optional(),
  }).passthrough(),
}));

export const InitializeResultSchema = BaseResultSchema.merge(z.object({
  protocolVersion: z.string(),
  capabilities: ServerCapabilitiesSchema,
  serverInfo: ImplementationSchema,
  instructions: z.string().optional(),
}));

export const InitializedNotificationSchema = z.object({
  method: z.literal('notifications/initialized'),
  params: z.object({}).optional(),
});

export const CancelledNotificationSchema = z.object({
  method: z.literal('notifications/cancelled'),
  params: z.object({
    requestId: z.union([z.string(), z.number()]),
    reason: z.string().optional(),
  }),
});

export type BaseMetadata = z.infer<typeof BaseMetadataSchema>;
export type Implementation = z.infer<typeof ImplementationSchema>;
export type ClientCapabilities = z.infer<typeof ClientCapabilitiesSchema>;
export type ServerCapabilities = z.infer<typeof ServerCapabilitiesSchema>;
export type InitializeRequest = z.infer<typeof InitializeRequestSchema>;
export type InitializeResult = z.infer<typeof InitializeResultSchema>;
export type InitializedNotification = z.infer<typeof InitializedNotificationSchema>;
export type CancelledNotification = z.infer<typeof CancelledNotificationSchema>;