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
