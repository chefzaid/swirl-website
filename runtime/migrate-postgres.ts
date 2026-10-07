import { createHash } from 'node:crypto';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import {
  CONTACT_LOCK,
  initializePostgres,
  PostgresContactDatabase,
} from './postgres.ts';

export async function importSqliteSnapshot(
  database: PostgresContactDatabase,
  path: string,
): Promise<{ imported: boolean; contacts: number; counters: number }> {
  if (existsSync(`${path}-wal`) && statSync(`${path}-wal`).size > 0)
    throw new Error(
      'Use a consistent standalone SQLite backup without an active WAL',
    );
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  const checksum = hash.digest('hex');
  const snapshot = new DatabaseSync(path, { readOnly: true });
  try {
    if (snapshot.prepare('PRAGMA quick_check').get()?.quick_check !== 'ok')
      throw new Error('Invalid SQLite snapshot');
    await initializePostgres(database);
    return await database.sql.begin(async (sql) => {
      await sql.unsafe('SELECT pg_advisory_xact_lock($1)', [CONTACT_LOCK]);
      if (
        (
          await sql.unsafe(
            'SELECT checksum FROM swirl_website_imports WHERE checksum = $1',
            [checksum],
          )
        ).length
      )
        return { imported: false, contacts: 0, counters: 0 };
      let contacts = 0;
      let counters = 0;
      // CRM delivery state travels with each contact; snapshots taken before
      // the CRM outbox existed queue their contacts for delivery.
      const crm = new Map<string, Record<string, unknown>>();
      if (
        snapshot
          .prepare(
            "SELECT 1 AS present FROM sqlite_master WHERE type = 'table' AND name = 'contact_crm_queue'",
          )
          .get()
      )
        for (const state of snapshot
          .prepare(
            'SELECT contact_id,status,attempts,run_at,lead_id,last_error FROM contact_crm_queue',
          )
          .iterate())
          crm.set(String(state.contact_id), state);
      // No historical record is enqueued for delivery. Existing sent, failed,
      // unconfigured and pending statuses survive exactly as saved in SQLite.
      for (const row of snapshot
        .prepare(
          'SELECT id,name,email,service,message,lang,created_at,notification_status FROM contact_messages',
        )
        .iterate()) {
        const old = await sql.unsafe(
          'SELECT * FROM contact_messages WHERE id = $1',
          [String(row.id)],
        );
        if (old.length) {
          if (Object.entries(row).some(([key, value]) => old[0][key] !== value))
            throw new Error(
              'Snapshot conflicts with an existing contact; nothing imported',
            );
        } else {
          await sql.unsafe(
            'INSERT INTO contact_messages (id,name,email,service,message,lang,created_at,notification_status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
            [
              String(row.id),
              String(row.name),
              String(row.email),
              String(row.service),
              String(row.message),
              String(row.lang),
              Number(row.created_at),
              String(row.notification_status),
            ],
          );
          const state = crm.get(String(row.id));
          await sql.unsafe(
            'INSERT INTO contact_crm_queue (contact_id,status,attempts,run_at,lead_id,last_error) VALUES ($1,$2,$3,$4,$5,$6)',
            [
              String(row.id),
              state ? String(state.status) : 'queued',
              state ? Number(state.attempts) : 0,
              state ? Number(state.run_at) : Number(row.created_at),
              state?.lead_id == null ? null : Number(state.lead_id),
              typeof state?.last_error === 'string' ? state.last_error : null,
            ],
          );
          contacts++;
        }
      }
      for (const row of snapshot
        .prepare('SELECT key,count,expires_at FROM contact_rate_limits')
        .iterate()) {
        const old = await sql.unsafe(
          'SELECT count,expires_at FROM contact_rate_limits WHERE key = $1',
          [String(row.key)],
        );
        if (old.length) {
          if (
            old[0].count !== row.count ||
            old[0].expires_at !== row.expires_at
          )
            throw new Error(
              'Snapshot conflicts with an existing quota; nothing imported',
            );
        } else {
          await sql.unsafe(
            'INSERT INTO contact_rate_limits (key,count,expires_at) VALUES ($1,$2,$3)',
            [String(row.key), Number(row.count), Number(row.expires_at)],
          );
          counters++;
        }
      }
      await sql.unsafe('INSERT INTO swirl_website_imports VALUES ($1,$2)', [
        checksum,
        Date.now(),
      ]);
      return { imported: true, contacts, counters };
    });
  } finally {
    snapshot.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  if (
    !(args.length === 1 && args[0] === '--initialize') &&
    !(args.length === 2 && args[0] === '--sqlite-snapshot')
  )
    throw new Error(
      'Usage: migrate-postgres --initialize | --sqlite-snapshot /private/contact.sqlite',
    );
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  const database = new PostgresContactDatabase(process.env.DATABASE_URL);
  try {
    if (args[0] === '--initialize') {
      await initializePostgres(database);
      console.log('Swirl Website PostgreSQL schema is ready');
    } else {
      console.log(
        JSON.stringify(await importSqliteSnapshot(database, resolve(args[1]))),
      );
    }
  } finally {
    await database.close();
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  main().catch(() => {
    console.error(
      'Swirl Website database migration failed; inspect the source/target before retrying',
    );
    process.exitCode = 1;
  });
}
