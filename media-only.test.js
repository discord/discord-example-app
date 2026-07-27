import assert from 'node:assert/strict';
import test from 'node:test';

import { hasAllowedMedia } from './media-only.js';

function createMessage({
  attachments = [],
  stickerCount = 0,
} = {}) {
  return {
    attachments: new Map(
      attachments.map((attachment, index) => [String(index), attachment]),
    ),
    stickers: {
      size: stickerCount,
    },
  };
}

test('accepts image and video attachments', () => {
  assert.equal(
    hasAllowedMedia(
      createMessage({
        attachments: [
          {
            name: 'photo.png',
            contentType: 'image/png',
          },
        ],
      }),
    ),
    true,
  );
  assert.equal(
    hasAllowedMedia(
      createMessage({
        attachments: [
          {
            name: 'clip.mp4',
            contentType: 'video/mp4',
          },
        ],
      }),
    ),
    true,
  );
});

test('accepts Discord stickers and media extensions without a content type', () => {
  assert.equal(hasAllowedMedia(createMessage({ stickerCount: 1 })), true);
  assert.equal(
    hasAllowedMedia(
      createMessage({
        attachments: [
          {
            name: 'animation.webp',
            contentType: null,
          },
        ],
      }),
    ),
    true,
  );
});

test('rejects text-only and document-only messages', () => {
  assert.equal(hasAllowedMedia(createMessage()), false);
  assert.equal(
    hasAllowedMedia(
      createMessage({
        attachments: [
          {
            name: 'document.pdf',
            contentType: 'application/pdf',
          },
        ],
      }),
    ),
    false,
  );
});
