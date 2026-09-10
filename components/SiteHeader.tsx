import { useState } from 'react';
import { ArrowUpRight, LockKeyhole, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Lang } from '@/data/portfolio';
export default function SiteHeader({ lang }: Readonly<{ lang: Lang }>) {
  const en = lang === 'en';
  const t = (fr: string, eng: string) => (en ? eng : fr);
  const [menu, setMenu] = useState(false);
  const nav = [
    ['home', t('Accueil', 'Home')],
    ['expertises', t('Expertises', 'Expertise')],
    ['projects', t('Références', 'Projects')],
    ['about', t('L’entreprise', 'Company')],
  ];
  return (
    <>
      <header className="header wrap">
        <a className="brand" href="#home" aria-label="Swirl">
          <img src="/assets/mark.svg" alt="" width="40" height="38" /> Swirl
          <i>.</i>
        </a>
        <nav aria-label={t('Navigation principale', 'Main navigation')}>
          {nav.map(([id, label]) => (
            <a
              key={id}
              className={id === 'home' ? 'active' : ''}
              href={`#${id}`}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <a
            className="intranet-link"
            href="https://dashboard.swirlit.dev"
            aria-label={t(
              'Intranet — Espace collaborateurs',
              'Intranet — Employee access',
            )}
            title={t('Espace collaborateurs', 'Employee access')}
          >
            <LockKeyhole size={12} aria-hidden="true" />
            Intranet
          </a>
          <div className="language" aria-label={t('Langue', 'Language')}>
            <a
              href="/"
              lang="fr"
              aria-label="Français"
              aria-current={!en ? 'page' : undefined}
            >
              FR
            </a>
            <span aria-hidden="true">/</span>
            <a
              href="/en/"
              lang="en"
              aria-label="English"
              aria-current={en ? 'page' : undefined}
            >
              EN
            </a>
          </div>
          <a className="button small contact-button" href="#contact">
            <span className="contact-label-full">
              {t('Parlons de votre projet', 'Let’s talk about your project')}
            </span>
            <span className="contact-label-compact">Contact</span>
            <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <Button
            className="menu-toggle"
            variant="ghost"
            size="icon"
            aria-label={
              menu
                ? t('Fermer le menu', 'Close menu')
                : t('Ouvrir le menu', 'Open menu')
            }
            aria-expanded={menu}
            aria-controls="mobile-nav"
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </Button>
        </div>
      </header>
      {menu && (
        <nav
          className="mobile-nav wrap"
          id="mobile-nav"
          aria-label={t('Navigation mobile', 'Mobile navigation')}
        >
          {[...nav, ['contact', 'Contact']].map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={() => setMenu(false)}>
              {label}
              <ArrowUpRight size={16} />
            </a>
          ))}
          <a
            className="intranet-link"
            href="https://dashboard.swirlit.dev"
            aria-label={t(
              'Intranet — Espace collaborateurs',
              'Intranet — Employee access',
            )}
            onClick={() => setMenu(false)}
          >
            <span>
              Intranet{' '}
              <small>{t('Espace collaborateurs', 'Employee access')}</small>
            </span>
            <LockKeyhole size={13} aria-hidden="true" />
          </a>
        </nav>
      )}
    </>
  );
}
