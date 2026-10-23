import type { MouseEvent } from 'react';
import { ArrowUpRight, LockKeyhole, Menu, Moon, Sun, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Lang } from '@/data/portfolio';

// The header of every page. The phone menu is a native popover, so it opens
// without JavaScript: other pages render this as static HTML. The homepage
// hydrates it on narrow screens only to close the menu after an in-page link.
export default function SiteHeader({
  lang,
  home,
  alternates,
}: Readonly<{
  lang: Lang;
  // The homepage path; omitted on the homepage, whose links stay in the page.
  home?: string;
  // This page in each language, for the language switch.
  alternates: Record<Lang, string>;
}>) {
  const en = lang === 'en';
  const t = (fr: string, eng: string) => (en ? eng : fr);
  const section = (id: string) => `${home ?? ''}#${id}`;
  const nav = [
    [home ?? '#home', t('Accueil', 'Home')],
    [section('expertises'), t('Expertises', 'Expertise')],
    [section('projects'), t('Références', 'Projects')],
    [section('about'), t('L’entreprise', 'Company')],
  ];
  const close = (event: MouseEvent<HTMLAnchorElement>) =>
    event.currentTarget.closest<HTMLElement>('[popover]')?.hidePopover();
  return (
    <>
      <header className="header wrap">
        <a className="brand" href={home ?? '#home'} aria-label="Swirl">
          <img src="/assets/mark.svg" alt="" width="40" height="38" /> Swirl
          <i>.</i>
        </a>
        <nav aria-label={t('Navigation principale', 'Main navigation')}>
          {nav.map(([href, label]) => (
            <a
              key={href}
              className={href === '#home' ? 'active' : undefined}
              href={href}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          {/* Handled by the page's theme script (src/layouts/Layout.astro),
              so it works on pages that load no JavaScript of their own. */}
          <button
            type="button"
            className="theme-toggle"
            data-theme-toggle=""
            aria-pressed="false"
            aria-label={t('Mode clair', 'Light mode')}
            title={t('Mode clair ou sombre', 'Light or dark mode')}
          >
            <Sun className="theme-icon-light" size={16} aria-hidden="true" />
            <Moon className="theme-icon-dark" size={16} aria-hidden="true" />
          </button>
          <div className="language" aria-label={t('Langue', 'Language')}>
            <a
              href={alternates.fr}
              lang="fr"
              aria-current={!en ? 'page' : undefined}
            >
              FR<span className="sr-only"> – Français</span>
            </a>
            <span aria-hidden="true">/</span>
            <a
              href={alternates.en}
              lang="en"
              aria-current={en ? 'page' : undefined}
            >
              EN<span className="sr-only"> – English</span>
            </a>
          </div>
          <a
            className="cloud-link"
            href="https://cloud.swirlit.dev"
            aria-label={t(
              'Swirl Cloud — Espace collaborateurs',
              'Swirl Cloud — Employee access',
            )}
            title={t('Espace collaborateurs', 'Employee access')}
          >
            <LockKeyhole size={12} aria-hidden="true" />
            Swirl Cloud
          </a>
          <Button
            className="menu-toggle"
            variant="ghost"
            size="icon"
            aria-label="Menu"
            popoverTarget="mobile-nav"
          >
            <Menu className="menu-open" aria-hidden="true" />
            <X className="menu-close" aria-hidden="true" />
          </Button>
        </div>
      </header>
      <nav
        className="mobile-nav"
        id="mobile-nav"
        popover="auto"
        aria-label={t('Navigation mobile', 'Mobile navigation')}
      >
        <div className="wrap">
          {[...nav, [section('contact'), 'Contact']].map(([href, label]) => (
            <a key={href} href={href} onClick={close}>
              {label}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}
