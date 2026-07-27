import pg from 'pg';

const { Pool } = pg;

let pool;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for bot database access');
  }

  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  return pool;
}

export async function getWelcomeSettings(guildId) {
  const result = await getPool().query(
    `
      SELECT
        enabled,
        channel_id AS "channelId",
        format,
        title_template AS "titleTemplate",
        body_template AS "bodyTemplate",
        embed_color AS "embedColor",
        include_timestamp AS "includeTimestamp"
      FROM welcome_settings
      WHERE guild_id = $1
        AND enabled = TRUE
      LIMIT 1
    `,
    [guildId],
  );

  return result.rows[0] ?? null;
}

export async function getExitSettings(guildId) {
  const result = await getPool().query(
    `
      SELECT
        enabled,
        channel_id AS "channelId",
        format,
        title_template AS "titleTemplate",
        body_template AS "bodyTemplate",
        embed_color AS "embedColor",
        include_timestamp AS "includeTimestamp"
      FROM exit_settings
      WHERE guild_id = $1
        AND enabled = TRUE
      LIMIT 1
    `,
    [guildId],
  );

  return result.rows[0] ?? null;
}

export async function isMediaOnlyChannel(guildId, channelId) {
  const result = await getPool().query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM media_only_channels
        WHERE guild_id = $1
          AND channel_id = $2
      ) AS "isMediaOnly"
    `,
    [guildId, channelId],
  );

  return result.rows[0]?.isMediaOnly === true;
}

export async function getEnabledGameServers(guildIds) {
  if (guildIds.length === 0) {
    return [];
  }

  const result = await getPool().query(
    `
      SELECT
        id,
        guild_id AS "guildId",
        name,
        provider,
        host,
        port,
        universe_id AS "universeId",
        place_id AS "placeId"
      FROM game_servers
      WHERE enabled = TRUE
        AND guild_id = ANY($1::varchar[])
      ORDER BY created_at, id
    `,
    [guildIds],
  );

  return result.rows;
}

export async function recordGameServerStatus(gameServerId, status) {
  await getPool().query(
    `
      INSERT INTO game_server_statuses (
        game_server_id,
        online,
        player_count,
        max_players,
        latency_ms,
        map_name,
        status_text,
        checked_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
      ON CONFLICT (game_server_id)
      DO UPDATE SET
        online = EXCLUDED.online,
        player_count = EXCLUDED.player_count,
        max_players = EXCLUDED.max_players,
        latency_ms = EXCLUDED.latency_ms,
        map_name = EXCLUDED.map_name,
        status_text = EXCLUDED.status_text,
        checked_at = EXCLUDED.checked_at,
        updated_at = EXCLUDED.updated_at
    `,
    [
      gameServerId,
      status.online,
      status.playerCount,
      status.maxPlayers,
      status.latencyMs,
      status.mapName,
      status.statusText,
      status.checkedAt,
    ],
  );
}

export async function recordGuildRuntimeStatus(
  guildIds,
  { connected, startedAt },
) {
  if (guildIds.length === 0) {
    return;
  }

  const recordedAt = new Date();

  await getPool().query(
    `
      INSERT INTO bot_guild_status (
        guild_id,
        connected,
        started_at,
        last_heartbeat_at,
        updated_at
      )
      SELECT
        guilds.id,
        $2,
        $3,
        $4,
        $4
      FROM guilds
      WHERE guilds.id = ANY($1::varchar[])
      ON CONFLICT (guild_id)
      DO UPDATE SET
        connected = EXCLUDED.connected,
        started_at = EXCLUDED.started_at,
        last_heartbeat_at = EXCLUDED.last_heartbeat_at,
        updated_at = EXCLUDED.updated_at
    `,
    [guildIds, connected, startedAt, recordedAt],
  );
}

export async function closeDatabase() {
  if (!pool) {
    return;
  }

  await pool.end();
  pool = undefined;
}
