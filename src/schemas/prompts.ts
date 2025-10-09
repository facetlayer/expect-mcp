import { z } from 'zod';
import { BaseMetadataSchema } from './initialization.js';
import { BaseRequestSchema, BaseResultSchema, CursorSchema } from './jsonrpc.js';
import { AnnotationsSchema } from './resources.js';

// Prompt content schemas - reusing from tools.ts patterns
export const PromptTextContentSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
  annotations: AnnotationsSchema.optional(),
  _meta: z.record(z.string(), z.unknown()).optional(),
});

export const PromptImageContentSchema = z.object({
  type: z.literal('image'),
  data: z.string(),
  mimeType: z.string(),
  annotations: AnnotationsSchema.optional(),
  _meta: z.record(z.string(), z.unknown()).optional(),
});

export const PromptAudioContentSchema = z.object({
  type: z.literal('audio'),
  data: z.string(),
  mimeType: z.string(),
  annotations: AnnotationsSchema.optional(),
  _meta: z.record(z.string(), z.unknown()).optional(),
});

export const PromptEmbeddedResourceSchema = z.object({
  type: z.literal('resource'),
  resource: z.object({
    uri: z.string(),
    name: z.string().optional(),
    title: z.string().optional(),
    mimeType: z.string().optional(),
    text: z.string().optional(),
    blob: z.string().optional(),
    annotations: AnnotationsSchema.optional(),
  }),
  _meta: z.record(z.string(), z.unknown()).optional(),
});

export const PromptContentSchema = z.union([
  PromptTextContentSchema,
  PromptImageContentSchema,
  PromptAudioContentSchema,
  PromptEmbeddedResourceSchema,
]);

export const PromptMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: PromptContentSchema,
});

export const PromptArgumentSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
});

export const PromptSchema = BaseMetadataSchema.merge(
  z.object({
    description: z.string().optional(),
    arguments: z.array(PromptArgumentSchema).optional(),
    _meta: z.record(z.string(), z.unknown()).optional(),
  })
);

export const ListPromptsRequestSchema = BaseRequestSchema.merge(
  z.object({
    method: z.literal('prompts/list'),
    params: z
      .object({
        cursor: CursorSchema.optional(),
        _meta: z.record(z.string(), z.unknown()).optional(),
      })
      .passthrough()
      .optional(),
  })
);

export const ListPromptsResultSchema = BaseResultSchema.merge(
  z.object({
    prompts: z.array(PromptSchema),
    nextCursor: CursorSchema.optional(),
  })
);

export const GetPromptRequestSchema = BaseRequestSchema.merge(
  z.object({
    method: z.literal('prompts/get'),
    params: z
      .object({
        name: z.string(),
        arguments: z.record(z.string(), z.unknown()).optional(),
        _meta: z.record(z.string(), z.unknown()).optional(),
      })
      .passthrough(),
  })
);

export const GetPromptResultSchema = BaseResultSchema.merge(
  z.object({
    description: z.string().optional(),
    messages: z.array(PromptMessageSchema),
  })
);

export const PromptListChangedNotificationSchema = z.object({
  method: z.literal('notifications/prompts/list_changed'),
  params: z.object({}).optional(),
});

export type PromptTextContent = z.infer<typeof PromptTextContentSchema>;
export type PromptImageContent = z.infer<typeof PromptImageContentSchema>;
export type PromptAudioContent = z.infer<typeof PromptAudioContentSchema>;
export type PromptEmbeddedResource = z.infer<typeof PromptEmbeddedResourceSchema>;
export type PromptContent = z.infer<typeof PromptContentSchema>;
export type PromptMessage = z.infer<typeof PromptMessageSchema>;
export type PromptArgument = z.infer<typeof PromptArgumentSchema>;
export type Prompt = z.infer<typeof PromptSchema>;
export type ListPromptsRequest = z.infer<typeof ListPromptsRequestSchema>;
export type ListPromptsResult = z.infer<typeof ListPromptsResultSchema>;
export type GetPromptRequest = z.infer<typeof GetPromptRequestSchema>;
export type GetPromptResult = z.infer<typeof GetPromptResultSchema>;
