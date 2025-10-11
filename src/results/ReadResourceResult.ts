import type {
  BlobResourceContents,
  ReadResourceResult as ReadResourceResultType,
  TextResourceContents,
} from '../schemas/resources.js';

/**
 * Wraps the result of a resource read with helper methods for accessing content.
 */
export class ReadResourceResult {
  static _isReadResourceResult = true;

  content: (TextResourceContents | BlobResourceContents)[] = [];

  constructor(result: ReadResourceResultType) {
    this.content = result.contents;
  }

  /**
   * Get the text content from the first text resource in the contents array.
   *
   * @returns The text content, or undefined if no text resources exist.
   *
   * @example
   * ```ts
   * const result = await app.readResource('file:///app/test.txt');
   * const text = result.getTextContent();
   * ```
   */
  getTextContent(): string | undefined {
    const textResource = this.content.find(
      (content): content is TextResourceContents => 'text' in content
    );
    return textResource?.text;
  }

  /**
   * Get the blob content from the first blob resource in the contents array.
   *
   * @returns The blob content (base64-encoded), or undefined if no blob resources exist.
   *
   * @example
   * ```ts
   * const result = await app.readResource('file:///app/image.png');
   * const blob = result.getBlobContent();
   * ```
   */
  getBlobContent(): string | undefined {
    const blobResource = this.content.find(
      (content): content is BlobResourceContents => 'blob' in content
    );
    return blobResource?.blob;
  }

  /**
   * Find a resource by its URI.
   *
   * @param uri The URI of the resource to find.
   * @returns The resource with the matching URI, or undefined.
   *
   * @example
   * ```ts
   * const result = await app.readResource('file:///app/test.txt');
   * const resource = result.findByUri('file:///app/test.txt');
   * ```
   */
  findByUri(uri: string): TextResourceContents | BlobResourceContents | undefined {
    return this.content.find(content => content.uri === uri);
  }

  /**
   * Get all text resources from the contents array.
   *
   * @returns An array of text resources.
   */
  getAllTextResources(): TextResourceContents[] {
    return this.content.filter(
      (content): content is TextResourceContents => 'text' in content
    );
  }

  /**
   * Get all blob resources from the contents array.
   *
   * @returns An array of blob resources.
   */
  getAllBlobResources(): BlobResourceContents[] {
    return this.content.filter(
      (content): content is BlobResourceContents => 'blob' in content
    );
  }

  /**
   * Check if the result contains any text resources.
   *
   * @returns True if at least one text resource exists.
   */
  hasTextContent(): boolean {
    return this.content.some(content => 'text' in content);
  }

  /**
   * Check if the result contains any blob resources.
   *
   * @returns True if at least one blob resource exists.
   */
  hasBlobContent(): boolean {
    return this.content.some(content => 'blob' in content);
  }
}
