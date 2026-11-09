import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

void test("the chat drawn while Odoo loads has Odoo's header colour", () => {
  // The platform's configure script sets the Live Chat channel from these.
  const persona = JSON.parse(
    readFileSync('infra/odoo/chat-persona.json', 'utf8'),
  ) as { colors: { background: string; text: string } };
  const base = readFileSync('styles/base.css', 'utf8');
  assert.match(
    base,
    new RegExp(`--chat-header: ${persona.colors.background};`),
  );
  const chat = readFileSync('styles/chat.css', 'utf8');
  const header = /\.chat-shell header \{[^}]*\}/.exec(chat)?.[0] ?? '';
  assert.match(header, /background: var\(--chat-header\);/);
  assert.match(header, new RegExp(`color: ${persona.colors.text};`));
});
