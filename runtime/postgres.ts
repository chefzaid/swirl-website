import postgres from 'postgres';
import type {
  ContactDatabase,
  DatabaseResult,
  DatabaseStatement,
} from '../db/index.ts';

export const SCHEMA_VERSION = 1;
export const CONTACT_LOCK = 193720;
type Connection = Pick<postgres.Sql, 'unsafe'>;
type Binding = string | number | null;

function binding(value: unknown): Binding {
  if (
    value === null ||
    typeof value === 'string' ||
    (typeof value === 'number' && Number.isSafeInteger(value))
  )
    return value;
  throw new TypeError('Unsupported PostgreSQL binding');
}

class Statement implements DatabaseStatement {
  readonly database: PostgresContactDatabase;
  readonly query: string;
  readonly values: Binding[];
  constructor(
    database: PostgresContactDatabase,
    query: string,
    values: Binding[] = [],
  ) {
    this.database = database;
    this.query = query;
    this.values = values;
  }
  bind(...values: unknown[]): Statement {
    return new Statement(this.database, this.query, values.map(binding));
  }
  async execute(connection: Connection): Promise<DatabaseResult> {
    // Application SQL uses parameter markers only outside literals. Reject
    // literals/comments containing a marker rather than silently rewriting it.
    if (/'[^']*\?[^']*'|--[^\n]*\?|\/\*/.test(this.query))
      throw new Error('Unsupported parameter syntax');
    let index = 0;
    const query = this.query.replaceAll('?', () => `$${++index}`);
    if (index !== this.values.length)
      throw new Error('Incorrect binding count');
    const rows = await connection.unsafe(query, this.values);
    return { results: Array.from(rows), meta: { changes: rows.count } };
  }
  async first<T>(): Promise<T | null> {
    const result = await this.run();
    return (result.results[0] as T | undefined) ?? null;
  }
  run(): Promise<DatabaseResult> {
    return this.execute(this.database.sql);
  }
}

export class PostgresContactDatabase implements ContactDatabase {
  readonly durableNotifications = true;
  readonly sql: postgres.Sql;
  deliverNotification?: (id: string) => Promise<boolean>;
  constructor(url: string) {
    const parsed = new URL(url);
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol))
      throw new Error('DATABASE_URL must be PostgreSQL');
    this.sql = postgres(url, {
      max: 5,
      connect_timeout: 5,
      idle_timeout: 20,
      max_lifetime: 1800,
      connection: { statement_timeout: 10000, application_name: 'website' },
      onnotice: () => {},
      types: {
        safeInteger: {
          to: 20,
          from: [20],
          serialize: String,
          parse: (value: string) => {
            const number = Number(value);
            if (!Number.isSafeInteger(number))
              throw new Error('Database integer outside safe range');
            return number;
          },
        },
      },
    });
  }
  prepare(query: string): Statement {
    return new Statement(this, query);
  }
  async batch(statements: DatabaseStatement[]): Promise<DatabaseResult[]> {
    return this.sql.begin(async (sql) => {
      // The small shared quota needs the same serialization SQLite's writer
      // transaction provided, across every API connection and replica.
      await sql.unsafe('SELECT pg_advisory_xact_lock($1)', [CONTACT_LOCK]);
      const results: DatabaseResult[] = [];
      for (const statement of statements) {
        if (!(statement instanceof Statement) || statement.database !== this)
          throw new Error('Statement belongs to a different database');
        results.push(await statement.execute(sql));
      }
      return results;
    });
  }
  async healthy(): Promise<boolean> {
    try {
      const rows = await this.sql.unsafe(
        'SELECT version FROM website_schema WHERE singleton = true',
      );
      return rows[0]?.version === SCHEMA_VERSION;
    } catch {
      return false;
    }
  }
  async close(): Promise<void> {
    await this.sql.end({ timeout: 5 });
  }
}

export async function initializePostgres(
  database: PostgresContactDatabase,
): Promise<void> {
  await database.sql.begin(async (sql) => {
    await sql.unsafe('SELECT pg_advisory_xact_lock($1)', [CONTACT_LOCK]);
    await sql.unsafe(`CREATE TABLE IF NOT EXISTS website_schema (
      singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton), version integer NOT NULL
    )`);
    const previous = await sql.unsafe('SELECT version FROM website_schema');
    if (previous.length) {
      if (previous[0].version !== SCHEMA_VERSION)
        throw new Error('Unsupported website schema version');
      return;
    }
    await sql.unsafe(`CREATE TABLE contact_messages (
      id text PRIMARY KEY, name text NOT NULL, email text NOT NULL,
      service text NOT NULL, message text NOT NULL, lang text NOT NULL,
      created_at bigint NOT NULL, notification_status text NOT NULL DEFAULT 'unconfigured'
    )`);
    await sql.unsafe(`CREATE TABLE contact_rate_limits (
      key text PRIMARY KEY, count integer NOT NULL, expires_at bigint NOT NULL
    )`);
    await sql.unsafe(
      'CREATE INDEX contact_rate_limits_expiry ON contact_rate_limits (expires_at)',
    );
    await sql.unsafe(`CREATE TABLE contact_notification_queue (
      contact_id text PRIMARY KEY REFERENCES contact_messages(id),
      provider text NOT NULL CHECK (provider IN ('resend','graph')), sender text NOT NULL,
      status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','sent','manual')),
      attempts integer NOT NULL DEFAULT 0, created_at bigint NOT NULL, run_at bigint NOT NULL,
      first_attempt_at bigint, locked_until bigint, locked_by text
    )`);
    await sql.unsafe(
      "CREATE INDEX contact_notification_due ON contact_notification_queue (run_at) WHERE status = 'queued'",
    );
    await sql.unsafe(
      'CREATE TABLE website_imports (checksum text PRIMARY KEY, imported_at bigint NOT NULL)',
    );
    await sql.unsafe('INSERT INTO website_schema (version) VALUES ($1)', [
      SCHEMA_VERSION,
    ]);
  });
}
