// The shared application only needs this subset of D1. The Node runtime
// implements the same contract with SQLite and transactional batches.
export interface DatabaseResult {
  results: unknown[];
  meta: { changes: number };
}
export interface DatabaseStatement {
  bind(...values: unknown[]): DatabaseStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<DatabaseResult>;
}
export interface ContactDatabase {
  readonly durableNotifications?: boolean;
  deliverNotification?: (id: string) => Promise<boolean>;
  prepare(sql: string): DatabaseStatement;
  batch(statements: DatabaseStatement[]): Promise<DatabaseResult[]>;
}
export function getDb(env: { DB?: ContactDatabase }): ContactDatabase {
  if (!env.DB) throw new Error('Contact database is unavailable');
  return env.DB;
}
