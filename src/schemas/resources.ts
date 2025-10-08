import { z } from 'zod';
import { BaseMetadataSchema } from './initialization.js';
import { BaseRequestSchema, BaseResultSchema, CursorSchema } from './jsonrpc.js';

export const AnnotationsSchema = z.object({
  audience: z.array(z.enum(['user', 'assistant'])).optional(),
  priority: z.number().min(0).max(1).optional(),
  lastModified: z.string().optional(),
});

export const ResourceSchema = BaseMetadataSchema.extend({
  uri: z.string().url(),
  description: z.string().optional(),
  mimeType: z.string().optional(),
  annotations: AnnotationsSchema.optional(),
  size: z.number().optional(),
  _meta: z.record(z.string(), z.unknown()).optional(),
});

export const ResourceTemplateSchema = BaseMetadataSchema.extend({
  uriTemplate: z.string(),
  description: z.string().optional(),
  mimeType: z.string().optional(),
  annotations: AnnotationsSchema.optional(),
  _meta: z.record(z.string(), z.unknown()).optional(),
});

export const ResourceContentsSchema = z.object({
  uri: z.string().url(),
  name: z.string().optional(),
  title: z.string().optional(),
  mimeType: z.string().optional(),
  annotations: AnnotationsSchema.optional(),
  _meta: z.record(z.string(), z.unknown()).optional(),
});

export const TextResourceContentsSchema = ResourceContentsSchema.extend({
  text: z.string(),
});

export const BlobResourceContentsSchema = ResourceContentsSchema.extend({
  blob: z.string(),
});

export const EmbeddedResourceSchema = z.object({
  type: z.literal('resource'),
  resource: z.union([TextResourceContentsSchema, BlobResourceContentsSchema]),
  annotations: AnnotationsSchema.optional(),
  _meta: z.record(z.string(), z.unknown()).optional(),
});

export const ResourceLinkSchema = ResourceSchema.extend({
  type: z.literal('resource_link'),
});

export const ListResourcesRequestSchema = BaseRequestSchema.merge(
  z.object({
    method: z.literal('resources/list'),
    params: z
      .object({
        cursor: CursorSchema.optional(),
        _meta: z.record(z.string(), z.unknown()).optional(),
      })
      .passthrough()
      .optional(),
  })
);

export const ListResourcesResultSchema = BaseResultSchema.merge(
  z.object({
    resources: z.array(ResourceSchema),
    nextCursor: CursorSchema.optional(),
  })
);

export const ReadResourceRequestSchema = BaseRequestSchema.merge(
  z.object({
    method: z.literal('resources/read'),
    params: z
      .object({
        uri: z.string().url(),
        _meta: z.record(z.string(), z.unknown()).optional(),
      })
      .passthrough(),
  })
);

export const ReadResourceResultSchema = BaseResultSchema.merge(
  z.object({
    contents: z.array(z.union([TextResourceContentsSchema, BlobResourceContentsSchema])),
  })
);

export const SubscribeRequestSchema = BaseRequestSchema.merge(
  z.object({
    method: z.literal('resources/subscribe'),
    params: z
      .object({
        uri: z.string().url(),
        _meta: z.record(z.string(), z.unknown()).optional(),
      })
      .passthrough(),
  })
);

export const UnsubscribeRequestSchema = BaseRequestSchema.merge(
  z.object({
    method: z.literal('resources/unsubscribe'),
    params: z
      .object({
        uri: z.string().url(),
        _meta: z.record(z.string(), z.unknown()).optional(),
      })
      .passthrough(),
  })
);

export const ResourceUpdatedNotificationSchema = z.object({
  method: z.literal('notifications/resources/updated'),
  params: z.object({
    uri: z.string().url(),
  }),
});

export const ResourceListChangedNotificationSchema = z.object({
  method: z.literal('notifications/resources/list_changed'),
  params: z.object({}).optional(),
});

export const ResourceReadResultSchema = ReadResourceResultSchema;

export type Annotations = z.infer<typeof AnnotationsSchema>;
export type Resource = z.infer<typeof ResourceSchema>;
export type ResourceTemplate = z.infer<typeof ResourceTemplateSchema>;
export type ResourceContents = z.infer<typeof ResourceContentsSchema>;
export type TextResourceContents = z.infer<typeof TextResourceContentsSchema>;
export type BlobResourceContents = z.infer<typeof BlobResourceContentsSchema>;
export type EmbeddedResource = z.infer<typeof EmbeddedResourceSchema>;
export type ResourceLink = z.infer<typeof ResourceLinkSchema>;
export type ListResourcesRequest = z.infer<typeof ListResourcesRequestSchema>;
export type ListResourcesResult = z.infer<typeof ListResourcesResultSchema>;
export type ReadResourceRequest = z.infer<typeof ReadResourceRequestSchema>;
export type ReadResourceResult = z.infer<typeof ReadResourceResultSchema>;
export type ResourceReadResult = z.infer<typeof ResourceReadResultSchema>;
