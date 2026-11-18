// Fails on any high or critical npm advisory except the exceptions below. An
// exception ends on its expiry date, or as soon as a fix exists: npm can apply
// one, or the package's latest release is no longer affected.
//
// Usage: node scripts/audit.mjs [a saved `npm audit --json` report]
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const exceptions = [
  {
    id: 'GHSA-fc5q-39xc-vjpf',
    package: 'picomatch',
    reason:
      'ReDoS from crafted glob patterns, with no fixed release yet. picomatch ' +
      'only matches build and server configuration globs, never visitor input.',
    expires: '2026-12-31',
  },
];

const blocking = new Set(['high', 'critical']);
const run = promisify(execFile);

async function npm(args) {
  try {
    const { stdout } = await run('npm', args, { maxBuffer: 64 * 1024 * 1024 });
    return stdout;
  } catch (error) {
    // npm audit exits with 1 when it reports advisories; keep its report.
    if (args[0] === 'audit' && error.stdout) return error.stdout;
    throw error;
  }
}

// npm proposes a semver-major "fix" that downgrades a dependent (Vite, Astro)
// to a release that predates the vulnerable package: that fixes nothing here.
async function fixFor(advisory, vulnerability) {
  const fix = vulnerability?.fixAvailable;
  if (fix === true) return 'npm audit fix can resolve it';
  if (fix && (!fix.isSemVerMajor || fix.name === advisory.name))
    return `npm reports a fix in ${fix.name} ${fix.version}`;
  const latest = (await npm(['view', advisory.name, 'version'])).trim();
  const registry = (await npm(['config', 'get', 'registry'])).trim();
  const response = await fetch(
    new URL('-/npm/v1/security/advisories/bulk', registry.replace(/\/?$/, '/')),
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ [advisory.name]: [latest] }),
    },
  );
  if (!response.ok)
    throw new Error(`The advisory lookup failed: HTTP ${response.status}`);
  const affecting = (await response.json())[advisory.name] ?? [];
  if (affecting.some((entry) => String(entry.url).endsWith(advisory.id)))
    return '';
  return `${advisory.name} ${latest} is not affected`;
}

const report = JSON.parse(
  process.argv[2]
    ? await readFile(process.argv[2], 'utf8')
    : await npm(['audit', '--json']),
);
if (report.error || report.auditReportVersion !== 2 || !report.vulnerabilities)
  throw new Error(
    `npm audit failed: ${JSON.stringify(report.error ?? report)}`,
  );

const advisories = new Map();
for (const vulnerability of Object.values(report.vulnerabilities)) {
  for (const via of vulnerability.via) {
    if (typeof via !== 'object') continue;
    const id = String(via.url ?? via.source)
      .split('/')
      .pop();
    advisories.set(`${id} ${via.name}`, { ...via, id });
  }
}

const today = new Date().toISOString().slice(0, 10);
const counts = report.metadata?.vulnerabilities ?? {};
console.log(
  `npm audit: ${counts.critical ?? 0} critical, ${counts.high ?? 0} high, ` +
    `${counts.moderate ?? 0} moderate and ${counts.low ?? 0} low packages, ` +
    'counting those affected through a dependency',
);
const failures = [];
const used = new Set();
for (const advisory of advisories.values()) {
  if (!blocking.has(advisory.severity)) continue;
  const label = `${advisory.id} (${advisory.severity}) in ${advisory.name}: ${advisory.title}`;
  const exception = exceptions.find(
    (entry) => entry.id === advisory.id && entry.package === advisory.name,
  );
  if (!exception) {
    failures.push(`${label} ${advisory.url ?? ''}`);
    continue;
  }
  used.add(exception);
  if (today > exception.expires) {
    failures.push(`${label}: its exception expired on ${exception.expires}`);
    continue;
  }
  const fix = await fixFor(advisory, report.vulnerabilities[advisory.name]);
  if (fix) {
    failures.push(`${label}: ${fix}, so its exception no longer applies`);
    continue;
  }
  console.log(`Excepted until ${exception.expires}: ${label}`);
  console.log(`  Reason: ${exception.reason}`);
}
for (const exception of exceptions) {
  if (!used.has(exception))
    console.log(
      `Exception ${exception.id} (${exception.package}) is no longer needed; remove it.`,
    );
}
if (failures.length) {
  console.error('High or critical advisories without a valid exception:');
  for (const failure of failures) console.error(`  ${failure}`);
  process.exitCode = 1;
} else {
  console.log('No high or critical advisory without a valid exception.');
}
