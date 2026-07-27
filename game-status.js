import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

import { GameDig } from 'gamedig';

const gameDigTypes = {
  FIVEM: 'gta5f',
  ASSETTO_CORSA: 'assettocorsa',
  MINECRAFT_JAVA: 'minecraftvanilla',
  MINECRAFT_BEDROCK: 'minecraftbedrock',
  BEAMMP: 'beammp',
};

function isPrivateIpv4(address) {
  const [first, second] = address.split('.').map(Number);

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 &&
      (second === 0 || second === 88 || second === 168)) ||
    (first === 198 && (second === 18 || second === 19)) ||
    (first === 198 && second === 51) ||
    (first === 203 && second === 0) ||
    first >= 224
  );
}

function isPrivateIpv6(address) {
  const normalized = address.toLowerCase();

  return (
    normalized === '::' ||
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    /^fe[89ab]/.test(normalized) ||
    normalized.startsWith('ff') ||
    normalized.startsWith('2001:db8:')
  );
}

export function isPublicAddress(address) {
  const family = isIP(address);

  if (family === 4) {
    return !isPrivateIpv4(address);
  }

  if (family === 6) {
    const mappedIpv4 = address.toLowerCase().match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);

    if (mappedIpv4) {
      return !isPrivateIpv4(mappedIpv4[1]);
    }

    return !isPrivateIpv6(address);
  }

  return false;
}

async function resolvePublicAddress(host, resolveHost = lookup) {
  const addresses = await resolveHost(host, {
    all: true,
    verbatim: true,
  });

  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => !isPublicAddress(address))
  ) {
    throw new Error('unsafe-address');
  }

  return addresses[0].address;
}

export function normalizeGameDigStatus(state) {
  return {
    online: true,
    playerCount: Number.isInteger(state.numplayers)
      ? state.numplayers
      : null,
    maxPlayers: Number.isInteger(state.maxplayers) ? state.maxplayers : null,
    latencyMs: Number.isFinite(state.ping) ? Math.round(state.ping) : null,
    mapName: state.map ? String(state.map).slice(0, 160) : null,
    statusText: state.name ? String(state.name).slice(0, 160) : 'Online',
  };
}

async function queryNetworkServer(
  server,
  { query = GameDig.query, resolveHost = lookup } = {},
) {
  const type = gameDigTypes[server.provider];

  if (!type || !server.host || !server.port) {
    throw new Error('invalid-configuration');
  }

  const publicAddress = await resolvePublicAddress(server.host, resolveHost);
  const state = await query({
    type,
    host: publicAddress,
    port: server.port,
    maxAttempts: 1,
    socketTimeout: 5_000,
    attemptTimeout: 8_000,
  });

  return normalizeGameDigStatus(state);
}

async function queryRobloxServer(server, fetchImpl = fetch) {
  if (!server.universeId) {
    throw new Error('invalid-configuration');
  }

  const response = await fetchImpl(
    `https://games.roblox.com/v1/games?universeIds=${encodeURIComponent(server.universeId)}`,
    {
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(8_000),
    },
  );

  if (!response.ok) {
    throw new Error('roblox-unavailable');
  }

  const body = await response.json();
  const experience = Array.isArray(body?.data) ? body.data[0] : null;

  if (!experience) {
    throw new Error('roblox-invalid-response');
  }

  return {
    online: true,
    playerCount: Number.isInteger(experience.playing)
      ? experience.playing
      : null,
    maxPlayers: Number.isInteger(experience.maxPlayers)
      ? experience.maxPlayers
      : null,
    latencyMs: null,
    mapName: null,
    statusText: experience.name
      ? String(experience.name).slice(0, 160)
      : 'Available',
  };
}

export async function queryGameServer(server, dependencies = {}) {
  if (server.provider === 'ROBLOX') {
    return queryRobloxServer(server, dependencies.fetchImpl);
  }

  return queryNetworkServer(server, dependencies);
}
