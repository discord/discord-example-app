import assert from 'node:assert/strict';
import test from 'node:test';

import {
  isPublicAddress,
  normalizeGameDigStatus,
  queryGameServer,
} from './game-status.js';

test('rejects private and reserved monitoring addresses', () => {
  assert.equal(isPublicAddress('127.0.0.1'), false);
  assert.equal(isPublicAddress('10.2.3.4'), false);
  assert.equal(isPublicAddress('192.168.1.20'), false);
  assert.equal(isPublicAddress('169.254.2.3'), false);
  assert.equal(isPublicAddress('192.0.2.10'), false);
  assert.equal(isPublicAddress('198.51.100.20'), false);
  assert.equal(isPublicAddress('203.0.113.30'), false);
  assert.equal(isPublicAddress('::ffff:127.0.0.1'), false);
  assert.equal(isPublicAddress('8.8.8.8'), true);
});

test('normalizes GameDig results for dashboard storage', () => {
  assert.deepEqual(
    normalizeGameDigStatus({
      name: 'Project Nexus',
      map: 'Los Santos',
      numplayers: 12,
      maxplayers: 64,
      ping: 42.4,
    }),
    {
      online: true,
      playerCount: 12,
      maxPlayers: 64,
      latencyMs: 42,
      mapName: 'Los Santos',
      statusText: 'Project Nexus',
    },
  );
});

test('queries Roblox only through its fixed universe endpoint', async () => {
  let requestedUrl;
  const status = await queryGameServer(
    {
      provider: 'ROBLOX',
      universeId: '123456',
    },
    {
      fetchImpl: async (url) => {
        requestedUrl = url;
        return {
          ok: true,
          async json() {
            return {
              data: [
                {
                  name: 'Nexus Racing',
                  playing: 18,
                  maxPlayers: 30,
                },
              ],
            };
          },
        };
      },
    },
  );

  assert.equal(
    requestedUrl,
    'https://games.roblox.com/v1/games?universeIds=123456',
  );
  assert.equal(status.online, true);
  assert.equal(status.playerCount, 18);
});

test('maps FiveM to its GameDig adapter after public DNS resolution', async () => {
  let options;
  const status = await queryGameServer(
    {
      provider: 'FIVEM',
      host: 'play.example.com',
      port: 30120,
    },
    {
      resolveHost: async () => [
        {
          address: '8.8.8.8',
          family: 4,
        },
      ],
      query: async (queryOptions) => {
        options = queryOptions;
        return {
          name: 'FiveM Server',
          numplayers: 4,
          maxplayers: 32,
          ping: 20,
        };
      },
    },
  );

  assert.equal(options.type, 'gta5f');
  assert.equal(options.host, '8.8.8.8');
  assert.equal(status.playerCount, 4);
});

test('maps every network provider to its dedicated GameDig adapter', async () => {
  const expectedTypes = {
    FIVEM: 'gta5f',
    ASSETTO_CORSA: 'assettocorsa',
    MINECRAFT_JAVA: 'minecraftvanilla',
    MINECRAFT_BEDROCK: 'minecraftbedrock',
    BEAMMP: 'beammp',
  };

  for (const [provider, expectedType] of Object.entries(expectedTypes)) {
    let actualType;

    await queryGameServer(
      {
        provider,
        host: 'play.example.com',
        port: 30_000,
      },
      {
        resolveHost: async () => [{ address: '8.8.8.8', family: 4 }],
        query: async ({ type }) => {
          actualType = type;
          return {};
        },
      },
    );

    assert.equal(actualType, expectedType);
  }
});
