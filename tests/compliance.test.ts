import { test } from 'node:test';
import assert from 'node:assert/strict';
import { controlGroups } from '../data/compliance-controls.ts';
import { referenceLabel } from '../data/compliance-frameworks.ts';

void test('the published control catalog is complete and bilingual', () => {
  const controls = controlGroups.flatMap((group) => group.controls);
  // Mirrors the platform catalog: 27 controls, 18 with automated checks.
  assert.equal(controls.length, 27);
  assert.equal(controls.filter((control) => control.automated).length, 18);
  for (const { title, objective, refs } of controls) {
    for (const text of [title.fr, title.en, objective.fr, objective.en])
      assert.ok(text.trim().length > 0);
    assert.ok(
      Object.values(refs).some((list) => list.length > 0),
      title.en,
    );
  }
  assert.equal(
    new Set(controls.map((control) => control.title.en)).size,
    controls.length,
  );
});

void test('descriptive CIS references are translated; numbered ones are kept', () => {
  assert.equal(
    referenceLabel('cis', 'Ubuntu: software updates', 'fr'),
    'Ubuntu : mises à jour logicielles',
  );
  assert.equal(
    referenceLabel('cis', 'Ubuntu: software updates', 'en'),
    'Ubuntu: software updates',
  );
  assert.equal(
    referenceLabel('cis', 'Kubernetes 5.3.2', 'fr'),
    'Kubernetes 5.3.2',
  );
  assert.equal(referenceLabel('nis2', '21(2)(i)', 'fr'), '21(2)(i)');
});
