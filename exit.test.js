import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildExitMessage,
  renderExitTemplate,
} from './exit.js';

const member = {
  user: {
    bot: false,
    username: 'departed-member',
  },
  guild: {
    name: 'TELEMATIC Community',
  },
};

test('renders the departed username and server variables', () => {
  assert.equal(
    renderExitTemplate('{user} left {server}.', member),
    '@departed-member left TELEMATIC Community.',
  );
});

test('suppresses all mentions in plain-text exit messages', () => {
  const message = buildExitMessage(
    {
      format: 'PLAIN_TEXT',
      bodyTemplate: '{user} left the server',
    },
    member,
  );

  assert.deepEqual(message.allowedMentions, {
    parse: [],
    users: [],
    roles: [],
    repliedUser: false,
  });
});

test('builds the configured exit embed', () => {
  const message = buildExitMessage(
    {
      format: 'EMBED',
      titleTemplate: 'GOODBYE FROM {server}',
      bodyTemplate: 'Take care, {user}',
      embedColor: '#912d08',
      includeTimestamp: true,
    },
    member,
  );

  assert.equal(message.embeds[0].data.title, 'GOODBYE FROM TELEMATIC Community');
  assert.equal(message.embeds[0].data.description, 'Take care, @departed-member');
  assert.equal(message.embeds[0].data.color, 9514248);
  assert.ok(message.embeds[0].data.timestamp);
});
