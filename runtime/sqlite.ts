import { DatabaseSync, type SQLInputValue } from 'node:sqlite';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import type {
  ContactDatabase,
  DatabaseResult,
  DatabaseStatement,
} from '../db/index.ts';

function binding(value: unknown): SQLInputValue {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'bigint' ||
    value instanceof Uint8Array
  )
    return value;
  throw new TypeError('Unsupported SQLite binding');
}

class Statement implements DatabaseStatement {
  readonly database: DatabaseSync;
  readonly sql: string;
  readonly values: SQLInputValue[];
  constructor(
    database: DatabaseSync,
    sql: string,
    values: SQLInputValue[] = [],
  ) {
    this.database = database;
    this.sql = sql;
    this.values = values;
  }

  bind(...values: unknown[]): Statement {
    return new Statement(this.database, this.sql, values.map(binding));
  }

  async first<T>(): Promise<T | null> {
    return (this.database.prepare(this.sql).get(...this.values) as T) ?? null;
  }

  execute(): DatabaseResult {
    const statement = this.database.prepare(this.sql);
    if (statement.columns().length) {
      const results = statement.all(...this.values);
      const changes = this.database
        .prepare('SELECT changes() AS changes')
        .get();
      return { results, meta: { changes: Number(changes?.changes ?? 0) } };
    }
    const result = statement.run(...this.values);
    return { results: [], meta: { changes: Number(result.changes) } };
  }

  async run(): Promise<DatabaseResult> {
    return this.execute();
  }
}

export class SqliteContactDatabase implements ContactDatabase {
  readonly sqlite: DatabaseSync;

  constructor(path: string, migrations: string) {
    this.sqlite = new DatabaseSync(path);
    try {
      this.sqlite.exec(
        'PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL;',
      );
      this.migrate(migrations);
    } catch (error) {
      this.sqlite.close();
      throw error;
    }
  }

  private migrate(directory: string) {
    this.sqlite.exec(
      'CREATE TABLE IF NOT EXISTS _swirl_website_migrations (name TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at INTEGER NOT NULL)',
    );
    this.sqlite.exec('BEGIN IMMEDIATE');
    try {
      for (const name of readdirSync(directory)
        .filter((file) => file.endsWith('.sql'))
        .sort((left, right) => left.localeCompare(right))) {
        const sql = readFileSync(join(directory, name), 'utf8');
        const checksum = createHash('sha256').update(sql).digest('hex');
        const previous = this.sqlite
          .prepare(
            'SELECT checksum FROM _swirl_website_migrations WHERE name = ?',
          )
          .get(name);
        if (previous) {
          if (previous.checksum !== checksum)
            throw new Error(`Applied migration changed: ${name}`);
          continue;
        }
        this.sqlite.exec(sql);
        this.sqlite
          .prepare('INSERT INTO _swirl_website_migrations VALUES (?, ?, ?)')
          .run(name, checksum, Date.now());
      }
      this.sqlite.exec('COMMIT');
    } catch (error) {
      this.sqlite.exec('ROLLBACK');
      throw error;
    }
  }

  prepare(sql: string): Statement {
    return new Statement(this.sqlite, sql);
  }

  async batch(statements: DatabaseStatement[]): Promise<DatabaseResult[]> {
    // No await occurs inside this transaction: another request cannot execute
    // SQL between reservation, quota updates, and the corresponding insert.
    this.sqlite.exec('BEGIN IMMEDIATE');
    try {
      const results = statements.map((statement) => {
        if (
          !(statement instanceof Statement) ||
          statement.database !== this.sqlite
        )
          throw new Error('Statement belongs to a different database');
        return statement.execute();
      });
      this.sqlite.exec('COMMIT');
      return results;
    } catch (error) {
      this.sqlite.exec('ROLLBACK');
      throw error;
    }
  }

  healthy(): boolean {
    return (
      this.sqlite
        .prepare('SELECT 1 AS ready FROM _swirl_website_migrations LIMIT 1')
        .get()?.ready === 1
    );
  }

  close() {
    this.sqlite.close();
  }
}
