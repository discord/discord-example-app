import {
  getEnabledGameServers,
  recordGameServerStatus,
} from './database.js';
import { queryGameServer } from './game-status.js';

const QUERY_CONCURRENCY = 5;

function offlineStatus(error) {
  return {
    online: false,
    playerCount: null,
    maxPlayers: null,
    latencyMs: null,
    mapName: null,
    statusText:
      error instanceof Error && error.message === 'unsafe-address'
        ? 'Private or reserved endpoint rejected'
        : 'Unavailable',
  };
}

async function checkAndRecordServer(server) {
  let status;

  try {
    status = await queryGameServer(server);
  } catch (error) {
    status = offlineStatus(error);
  }

  await recordGameServerStatus(server.id, {
    ...status,
    checkedAt: new Date(),
  });
}

export async function pollGameServerStatuses(guildIds) {
  const servers = await getEnabledGameServers(guildIds);

  for (let index = 0; index < servers.length; index += QUERY_CONCURRENCY) {
    const batch = servers.slice(index, index + QUERY_CONCURRENCY);
    const results = await Promise.allSettled(batch.map(checkAndRecordServer));

    results.forEach((result, resultIndex) => {
      if (result.status === 'rejected') {
        console.error(
          `Could not persist game server status ${batch[resultIndex].id}:`,
          result.reason,
        );
      }
    });
  }
}
