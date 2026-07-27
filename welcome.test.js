import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildWelcomeMessage,
  renderWelcomeTemplate,
} from './welcome.js';

const member = {
  id: '123456789012345678',
  guild: {
    name: 'TELEMATIC Community',
  },
};

test('renders the supported member and server variables', () => {
  assert.equal(
    renderWelcomeTemplate('Welcome to {server}, {user}!', member),
    'Welcome to TELEMATIC Community, <@123456789012345678>!',
  );
});

test('restricts plain-text mentions to the joining member', () => {
  const message = buildWelcomeMessage(
    {
      format: 'PLAIN_TEXT',
      bodyTemplate: 'Welcome {user}',
    },
    member,
  );

  assert.deepEqual(message.allowedMentions, {
    parse: [],
    users: ['123456789012345678'],
    repliedUser: false,
  });
});

test('builds the configured embed', () => {
  const message = buildWelcomeMessage(
    {
      format: 'EMBED',
      titleTemplate: 'WELCOME TO {server}',
      bodyTemplate: 'Hello {user}',
      embedColor: '#36d38d',
      includeTimestamp: true,
    },
    member,
  );

  assert.equal(message.embeds[0].data.title, 'WELCOME TO TELEMATIC Community');
  assert.equal(message.embeds[0].data.description, 'Hello <@123456789012345678>');
  assert.equal(message.embeds[0].data.color, 3593101);
  assert.ok(message.embeds[0].data.timestamp);
});
