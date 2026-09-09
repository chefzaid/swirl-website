import { ArrowUpRight } from 'lucide-react';
import type { Lang } from '@/data/portfolio';
import { homePath, siteConfig } from '@/data/site';
import LinkedInIcon from './LinkedInIcon';

export default function SiteFooter({
  lang,
  homeHref = homePath(lang),
}: Readonly<{
  lang: Lang;
  homeHref?: string;
}>) {
  const en = lang === 'en';
  return (
    <footer className="footer wrap">
      <div className="footer-branding">
        <a className="brand" href={homeHref} aria-label="Swirl IT">
          <img src="/assets/mark.svg" alt="" width="32" height="32" /> Swirl{' '}
          <span>IT</span>
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
        <a href={en ? '/en/privacy/' : '/confidentialite/'}>
          {en ? 'Privacy' : 'Confidentialité'}
        </a>
        <a className="text-link" href="#top">
          {en ? 'Back to top' : 'Retour en haut'}
          <ArrowUpRight size={15} aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}
