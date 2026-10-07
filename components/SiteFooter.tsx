import { ArrowUpRight } from 'lucide-react';
import { sectors, services, type Lang } from '@/data/portfolio';
import {
  homePath,
  privacyPath,
  projectsPath,
  servicePath,
  siteConfig,
} from '@/data/site';
import LinkedInIcon from './LinkedInIcon';

export default function SiteFooter({
  lang,
  homeHref = homePath(lang),
}: Readonly<{
  lang: Lang;
  homeHref?: string;
}>) {
  const en = lang === 'en';
  const home = homePath(lang);
  // Crawlable site map: every page is at most two links from any page.
  const columns = [
    {
      title: en ? 'Expertise' : 'Expertises',
      links: services.map((s) => [servicePath(s.id, lang), s.title[lang]]),
    },
    {
      title: en ? 'Case studies' : 'Références',
      links: [
        [projectsPath(lang), en ? 'All case studies' : 'Toutes les références'],
        ...sectors.map((s) => [
          `${projectsPath(lang)}#${s.anchor[lang]}`,
          s.label[lang],
        ]),
      ],
    },
    {
      title: 'Swirl',
      links: [
        [`${home}#about`, en ? 'Company' : 'L’entreprise'],
        [`${home}#contact`, 'Contact'],
        [privacyPath(lang), en ? 'Privacy' : 'Confidentialité'],
      ],
    },
  ];
  return (
    <footer className="footer wrap">
      <nav className="footer-nav" aria-label={en ? 'Site map' : 'Plan du site'}>
        {columns.map((column) => (
          <div key={column.title}>
            <p className="footer-heading">{column.title}</p>
            <ul>
              {column.links.map(([href, label]) => (
                <li key={href}>
                  <a href={href}>{label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
      <div className="footer-branding">
        <a className="brand" href={homeHref} aria-label="Swirl">
          <img src="/assets/mark.svg" alt="" width="32" height="32" /> Swirl
          <i>.</i>
        </a>
        <a
          className="social-link"
          href={siteConfig.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={
            en
              ? 'Zaïd Chefchaouni on LinkedIn (new tab)'
              : 'Zaïd Chefchaouni sur LinkedIn (nouvel onglet)'
          }
          title="LinkedIn — Zaïd Chefchaouni"
        >
          <LinkedInIcon />
        </a>
      </div>
      <p className="footer-copyright">
        © 2013–2026 Swirl IT.{' '}
        {en ? 'All rights reserved.' : 'Tous droits réservés.'}
      </p>
      <div className="footer-links">
        <a href={privacyPath(lang)}>{en ? 'Privacy' : 'Confidentialité'}</a>
        <a className="text-link" href="#top">
          {en ? 'Back to top' : 'Retour en haut'}
          <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}
