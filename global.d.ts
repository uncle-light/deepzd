/// <reference types="next" />

// Intl.Segmenter type declarations (available in Node.js 16+)
declare namespace Intl {
  interface SegmenterOptions {
    localeMatcher?: 'best fit' | 'lookup';
    granularity?: 'grapheme' | 'word' | 'sentence';
  }

  interface SegmentData {
    segment: string;
    index: number;
    input: string;
    isWordLike?: boolean;
  }

  interface Segments {
    [Symbol.iterator](): IterableIterator<SegmentData>;
  }

  class Segmenter {
    constructor(locales?: string | string[], options?: SegmenterOptions);
    segment(input: string): Segments;
  }
}
