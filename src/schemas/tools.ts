import { z } from 'zod';
import { BaseRequestSchema, BaseResultSchema, CursorSchema } from './jsonrpc.js';
import { BaseMetadataSchema } from './initialization.js';

export const TextContentSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
  annotations: z.record(z.unknown()).optional(),
  _meta: z.record(z.unknown()).optional(),
});

export const ImageContentSchema = z.object({
  type: z.literal('image'),
  data: z.string(),
  mimeType: z.string(),
  annotations: z.record(z.unknown()).optional(),
  _meta: z.record(z.unknown()).optional(),
});

export const AudioContentSchema = z.object({
  type: z.literal('audio'),
  data: z.string(),
  mimeType: z.string(),
  annotations: z.record(z.unknown()).optional(),
  _meta: z.record(z.unknown()).optional(),
});

export const ContentBlockSchema = z.union([
  TextContentSchema,
  ImageContentSchema,
  AudioContentSchema,
]);

export const JSONSchemaObjectSchema = z.object({
  type: z.literal('object'),
  properties: z.record(z.object({})).optional(),
  required: z.array(z.string()).optional(),
});

export const ToolAnnotationsSchema = z.object({
  title: z.string().optional(),
  readOnlyHint: z.boolean().optional(),
  destructiveHint: z.boolean().optional(),
  idempotentHint: z.boolean().optional(),
  openWorldHint: z.boolean().optional(),
});

export const ToolSchema = BaseMetadataSchema.merge(z.object({
  description: z.string().optional(),
  inputSchema: JSONSchemaObjectSchema,
  outputSchema: JSONSchemaObjectSchema.optional(),
  annotations: ToolAnnotationsSchema.optional(),
  _meta: z.record(z.unknown()).optional(),
}));

export const ListToolsRequestSchema = BaseRequestSchema.merge(z.object({
  method: z.literal('tools/list'),
  params: z.object({
    cursor: CursorSchema.optional(),
    _meta: z.record(z.unknown()).optional(),
  }).passthrough().optional(),
}));

export const ListToolsResultSchema = BaseResultSchema.merge(z.object({
  tools: z.array(ToolSchema),
  nextCursor: CursorSchema.optional(),
}));

export const CallToolRequestSchema = BaseRequestSchema.merge(z.object({
  method: z.literal('tools/call'),
  params: z.object({
    name: z.string(),
    arguments: z.record(z.unknown()).optional(),
    _meta: z.record(z.unknown()).optional(),
  }).passthrough(),
}));

export const CallToolResultSchema = BaseResultSchema.merge(z.object({
  content: z.array(ContentBlockSchema),
  structuredContent: z.record(z.unknown()).optional(),
  isError: z.boolean().optional(),
}));

export const ToolListChangedNotificationSchema = z.object({
  method: z.literal('notifications/tools/list_changed'),
  params: z.object({}).optional(),
});

export type TextContent = z.infer<typeof TextContentSchema>;
export type ImageContent = z.infer<typeof ImageContentSchema>;
export type AudioContent = z.infer<typeof AudioContentSchema>;
export type ContentBlock = z.infer<typeof ContentBlockSchema>;
export type JSONSchemaObject = z.infer<typeof JSONSchemaObjectSchema>;
export type ToolAnnotations = z.infer<typeof ToolAnnotationsSchema>;
export type Tool = z.infer<typeof ToolSchema>;
export type ListToolsRequest = z.infer<typeof ListToolsRequestSchema>;
export type ListToolsResult = z.infer<typeof ListToolsResultSchema>;
export type CallToolRequest = z.infer<typeof CallToolRequestSchema>;
export type CallToolResult = z.infer<typeof CallToolResultSchema>;