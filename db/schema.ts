import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
export const contactMessages = sqliteTable(
  'contact_messages',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
    service: text('service').notNull(),
    message: text('message').notNull(),
    lang: text('lang').notNull(),
    createdAt: integer('created_at').notNull(),
    notificationStatus: text('notification_status')
      .notNull()
      .default('unconfigured'),
  },
  (t) => [index('idx_contact_messages_created_at').on(t.createdAt)],
);
export const rateLimits = sqliteTable(
  'contact_rate_limits',
  {
    key: text('key').primaryKey(),
    count: integer('count').notNull(),
    expiresAt: integer('expires_at').notNull(),
  },
  (t) => [index('idx_contact_rate_limits_expires_at').on(t.expiresAt)],
);
