import pg from 'pg';

const { Pool } = pg;

let pool;

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required for welcome-message delivery');
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

export async function closeDatabase() {
  if (!pool) {
    return;
  }

  await pool.end();
  pool = undefined;
}
