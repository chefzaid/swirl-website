import type { ReactNode } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  Cpu,
  Code2,
  Cloud,
  MapPin,
  Check,
} from 'lucide-react';
import {
  services,
  fixedPriceService,
  partners,
  projects,
  type Lang,
} from '@/data/portfolio';
import { clientRows } from '@/data/client-logos';
import ClientLogo from './ClientLogo';
import SoftwareLifecycle from './SoftwareLifecycle';
import SiteFooter from './SiteFooter';
interface Props {
  lang: Lang;
  // Astro provides named slots at render time rather than as explicit JSX props.
  header?: ReactNode;
  projectsContent?: ReactNode;
  contactForm?: ReactNode;
}
export default function Portfolio({
  lang,
  header,
  projectsContent,
  contactForm,
}: Props) {
  const en = lang === 'en';
  const t = (fr: string, eng: string) => (en ? eng : fr);
  return (
    <>
      <a className="skip-link" href="#main">
        {t('Aller au contenu', 'Skip to content')}
      </a>
      {header}
      <main id="main">
        <div id="home" />
        <section className="hero wrap" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="status-dot" />
              {t(
                'CONSEIL & INGÉNIERIE LOGICIELLE',
                'SOFTWARE CONSULTING & ENGINEERING',
              )}
            </p>
            <h1 id="hero-title">
              {en ? (
                <>
                  Ambitious
                  <br />
                  ideas.
                  <br />
                  <span>
                    Solid
                    <br />
                    solutions.
                  </span>
                </>
              ) : (
                <>
                  Des idées
                  <br />
                  ambitieuses.
                  <br />
                  <span>
                    Des solutions
                    <br />
                    solides.
                  </span>
                </>
              )}
            </h1>
            <p className="hero-description">
              {fixedPriceService.description[lang]}
            </p>
            <div className="hero-actions">
              <a className="button" href="#projects">
                {t('Explorer nos projets', 'Explore our projects')}
                <ArrowUpRight size={18} />
              </a>
              <a className="text-link" href="#about">
                {t('Découvrir Swirl IT', 'About Swirl IT')}
                <ArrowDown size={16} />
              </a>
            </div>
            <div className="hero-facts">
              <div>
                <strong>
                  13<span>+</span>
                </strong>
                <small>{t('années d’expérience', 'years of experience')}</small>
              </div>
              <div>
                <strong>{projects.length}</strong>
                <small>
                  {t('clients grands comptes', 'enterprise clients')}
                </small>
              </div>
              <div>
                <strong>3</strong>
                <small>{t('domaines d’expertise', 'areas of expertise')}</small>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <SoftwareLifecycle lang={lang} />
          </div>
        </section>
        <section
          className="trust wrap"
          aria-label={t('Quelques références', 'Selected clients')}
        >
          <p>
            {t(
              'DES PROJETS POUR DES ÉQUIPES EXIGEANTES',
              'PROJECTS FOR TEAMS WITH HIGH STANDARDS',
            )}
          </p>
          {/* oxlint-disable jsx-a11y/no-noninteractive-tabindex -- Keyboard users need focus to scroll both client rows. */}
          <section
            className="client-logos"
            aria-label={t(
              'Clients — deux lignes défilantes',
              'Clients — two scrollable rows',
            )}
            tabIndex={0}
          >
            {clientRows.map((row) => (
              <div className="client-row" key={row[0]}>
                {row.map((id) => (
                  <ClientLogo key={id} id={id} />
                ))}
              </div>
            ))}
          </section>
          {/* oxlint-enable jsx-a11y/no-noninteractive-tabindex */}
        </section>
        <section className="section wrap" id="expertises">
          <div className="section-heading">
            <div>
              <p className="eyebrow section-kicker">
                01 / {t('EXPERTISES', 'EXPERTISE')}
              </p>
              <h2>
                {t('La bonne expertise.', 'The right expertise.')}
                <br />
                <span>{t('Au bon moment.', 'At the right moment.')}</span>
              </h2>
            </div>
            <p className="section-intro">
              {t(
                'Une approche de bout en bout pour donner vie à vos projets et moderniser vos flux de travail.',
                'An end-to-end approach to bring your projects to life and modernize your workflows.',
              )}
            </p>
          </div>
          <div className="services-grid">
            {services.map((s, i) => {
              const Icon = [Code2, Cpu, Cloud][i];
              return (
                <article className="service-card" key={s.id}>
                  <div className="service-top">
                    <Icon size={28} strokeWidth={1.3} />
                    <span>0{i + 1}</span>
                  </div>
                  <h3>{s.title[lang]}</h3>
                  <p>{s.text[lang]}</p>
                  <div className="tags">
                    {s.tags.map((tag) => (
                      <span key={tag}>
                        {en
                          ? tag
                              .replace('intégration', 'integration')
                              .replace('Supervision', 'Monitoring')
                          : tag.replace('Observability', 'Observabilité')}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
        {projectsContent}
        <section className="section about wrap" id="about">
          <div className="about-side">
            <p className="eyebrow section-kicker">
              03 / {t('L’ENTREPRISE', 'THE COMPANY')}
            </p>
            <div className="about-photo">
              <img
                src="/assets/portrait.webp"
                alt={t(
                  'Zaïd Chefchaouni, CEO de Swirl IT',
                  'Zaïd Chefchaouni, CEO of Swirl IT',
                )}
                width="864"
                height="1184"
                loading="lazy"
              />
            </div>
            <div className="about-signature">
              <p className="founder-name">
                <span>Zaïd Chefchaouni</span>
                <span className="founder-dot" aria-hidden="true" />
                <span className="sr-only">, </span>
                <span className="founder-title">CEO</span>
              </p>
              <blockquote>
                <span className="quote-mark" aria-hidden="true">
                  “
                </span>
                <span>
                  {t(
                    "Le perfectionnisme n'est pas un défaut.",
                    'Perfectionism is not a flaw.',
                  )}
                </span>
                <span className="quote-mark" aria-hidden="true">
                  ”
                </span>
              </blockquote>
            </div>
          </div>
          <div className="about-copy">
            <h2>
              {t('Vos ambitions,', 'Your ambitions,')}
              <br />
              <span>{t('notre engagement.', 'our commitment.')}</span>
            </h2>
            <p>
              {t(
                'Nous privilégions les solutions simples, les échanges clairs et les collaborations qui durent.',
                'We value simple solutions, clear communication and lasting partnerships.',
              )}
            </p>
            <p>
              {t(
                'Swirl IT s’appuie sur une expérience technique acquise depuis 2013 dans la banque, l’assurance, l’énergie, l’industrie et les services. Nous accompagnons les entreprises du développement web aux systèmes embarqués, jusqu’au cloud et à l’IA, avec une même exigence de qualité et de fiabilité.',
                'Swirl IT draws on technical experience built since 2013 across banking, insurance, energy, industry and services. We support businesses in web development, embedded systems, cloud and AI, with the same commitment to quality and reliability.',
              )}
            </p>
            <ul className="values">
              {[
                t(
                  'Des choix techniques expliqués, documentés et durables.',
                  'Clear, documented technical decisions that last.',
                ),
                t(
                  'Une implication concrète, de la conception à la production.',
                  'Hands-on involvement, from design to production.',
                ),
                t(
                  'Du partage, des revues de code et de la transmission.',
                  'Knowledge sharing, code reviews and mentoring.',
                ),
              ].map((v) => (
                <li key={v}>
                  <Check size={16} />
                  {v}
                </li>
              ))}
            </ul>
            <div className="locations">
              <span className="location">
                <MapPin size={15} />
                Paris, France
              </span>
              <span className="location">
                <MapPin size={15} />
                New York, USA
              </span>
              <span className="location">
                <MapPin size={15} />
                {t('Casablanca, Maroc', 'Casablanca, Morocco')}
              </span>
            </div>
            <a className="text-link" href="#contact">
              {t(
                'Construisons la suite ensemble',
                'Let’s build what comes next',
              )}
              <ArrowUpRight size={17} />
            </a>
          </div>
        </section>
        <section className="partners wrap">
          <p className="eyebrow">
            {t(
              'DES PARTENARIATS QUI FONT AVANCER',
              'PARTNERSHIPS THAT MOVE PROJECTS FORWARD',
            )}
          </p>
          <div>
            {partners.map((p) => (
              <span key={p}>{p}</span>
            ))}
          </div>
        </section>
        <section className="contact-section" id="contact">
          <div className="wrap contact-grid">
            <div className="contact-copy">
              <p className="eyebrow section-kicker">04 / CONTACT</p>
              <h2>
                {t('Un projet en tête ?', 'Have a project in mind?')}
                <br />
                <span>{t('Parlons-en.', 'Let’s talk.')}</span>
              </h2>
              <p>
                {t(
                  'Un défi technique ou simplement une idée à explorer. Tout commence par une conversation.',
                  'A technical challenge or an idea to explore. It all starts with a conversation.',
                )}
              </p>
              <a className="contact-email" href="mailto:contact@swirlit.dev">
                contact@swirlit.dev
                <ArrowUpRight size={22} />
              </a>
              <div className="contact-footnote">
                <img src="/assets/mark.svg" alt="" width="52" height="52" />
                <span>
                  {t('Donnons de l’élan', 'Give your ideas')}
                  <br />
                  {t('à vos idées.', 'room to take flight.')}
                </span>
              </div>
            </div>
            {contactForm}
          </div>
        </section>
      </main>
      <SiteFooter lang={lang} homeHref="#home" />
    </>
  );
}
