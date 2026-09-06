import { writeFileSync } from 'node:fs';
import { securityHeaders } from '../server/security.ts';

writeFileSync(
  'dist/client/_headers',
  '/*\n' +
    Object.entries(securityHeaders)
      .map(([name, value]) => `  ${name}: ${value}\n`)
      .join(''),
);
