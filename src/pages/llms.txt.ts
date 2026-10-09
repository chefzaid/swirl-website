import { projects, services } from '../../data/portfolio';
import { servicePages } from '../../data/expertise';
import { product } from '../../data/product';
import { howItWorks } from '../../data/how-it-works';
import { security } from '../../data/security';
import {
  absoluteUrl,
  homePath,
  privacyPath,
  productPagePath,
  productPath,
  projectPath,
  projectsPath,
  servicePath,
  siteConfig,
} from '../../data/site';

// Plain-language site summary for AI answer engines (https://llmstxt.org/),
// generated from the same content as the pages.
export function GET() {
  const link = (name: string, path: string, note?: string) =>
    `- [${name}](${absoluteUrl(path)})${note ? `: ${note}` : ''}`;
  const body = [
    `# ${siteConfig.name}`,
    '',
    `> ${siteConfig.name} designs, builds and hosts tailored software: web and mobile applications, embedded systems and IoT, and a sovereign private cloud with AI integration. Experience since 2013 across banking, insurance, energy, industry and services, present in Paris, New York and Casablanca. The site is published in French (default) and English.`,
    '',
    `Contact: ${siteConfig.email} or the form at ${absoluteUrl(`${homePath('en')}#contact`)}.`,
    '',
    '## Expertise',
    '',
    ...services.map((service) =>
      link(
        service.title.en,
        servicePath(service.id, 'en'),
        servicePages[service.id].description.en,
      ),
    ),
    '',
    '## Product',
    '',
    link(product.name, productPath('en'), product.description.en),
    link(
      'How Swirl Cloud works',
      productPagePath('how-it-works', 'en'),
      howItWorks.description.en,
    ),
    link(
      'Swirl Cloud security and compliance',
      productPagePath('security', 'en'),
      security.description.en,
    ),
    '',
    '## Case studies',
    '',
    link('All case studies', projectsPath('en')),
    ...projects.map((project) =>
      link(
        `${project.client} (${project.date})`,
        projectPath(project.id, 'en'),
        project.text.en,
      ),
    ),
    '',
    '## Optional',
    '',
    link('Home (English)', homePath('en')),
    link('Accueil (français)', homePath('fr')),
    ...services.map((service) =>
      link(service.title.fr, servicePath(service.id, 'fr')),
    ),
    link(`${product.name} (français)`, productPath('fr')),
    link('Références (français)', projectsPath('fr')),
    link('Privacy', privacyPath('en')),
    '',
  ].join('\n');
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
