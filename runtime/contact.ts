import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { SqliteContactDatabase } from './sqlite.ts';
import { PostgresContactDatabase } from './postgres.ts';
import { NotificationDispatcher } from './notifications.ts';
import { CrmDispatcher } from './crm.ts';
import { odooConfigured } from '../server/odoo.ts';

// Development and production use the same migrations, storage and notifications.
export async function createContactRuntime(options: {
  root: string;
  dataDir: string;
  variables: NodeJS.ProcessEnv;
}) {
  const { root, dataDir, variables } = options;
  if (!variables.DATABASE_URL)
    mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  const database = variables.DATABASE_URL
    ? new PostgresContactDatabase(variables.DATABASE_URL)
    : new SqliteContactDatabase(
        resolve(dataDir, 'contact.sqlite'),
        resolve(root, 'db/migrations'),
      );
  if (!(await database.healthy())) {
    await database.close();
    throw new Error(
      'Swirl Website schema is unavailable; run the explicit migration first',
    );
  }
  const odoo = {
    ODOO_URL: variables.ODOO_URL,
    ODOO_DATABASE: variables.ODOO_DATABASE,
    ODOO_API_KEY: variables.ODOO_API_KEY,
  };
  if (odoo.ODOO_URL && !/^https?:\/\/[^/?#]+\/?$/.test(odoo.ODOO_URL)) {
    await database.close();
    throw new Error('ODOO_URL must be an http(s) origin');
  }
  // Without Odoo settings, inquiries stay queued until they are provided.
  const crm = odooConfigured(odoo)
    ? new CrmDispatcher(database, odoo)
    : undefined;
  const env = {
    DB: database,
    CRM: crm,
    RESEND_API_KEY: variables.RESEND_API_KEY,
    MS_TENANT_ID: variables.MS_TENANT_ID,
    MS_CLIENT_ID: variables.MS_CLIENT_ID,
    MS_CLIENT_SECRET: variables.MS_CLIENT_SECRET,
    CONTACT_SENDER: variables.CONTACT_SENDER,
  };
  let stopNotifications: (() => Promise<void>) | undefined;
  const stopCrm = crm?.start();
  if (database instanceof PostgresContactDatabase) {
    const dispatcher = new NotificationDispatcher(database, env);
    database.deliverNotification = (id) => dispatcher.deliver(id);
    stopNotifications = dispatcher.start();
  }
  return {
    env,
    healthy: () => database.healthy(),
    async close() {
      await stopNotifications?.();
      await stopCrm?.();
      await database.close();
    },
  };
}
