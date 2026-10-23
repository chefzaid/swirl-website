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
  applicationService,
  partners,
  projects,
  type Lang,
} from '@/data/portfolio';
import { clientRows } from '@/data/client-logos';
import { product } from '@/data/product';
import { productPath, resourcesPath, servicePath } from '@/data/site';
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
}: Readonly<Props>) {
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
            <h1 id="hero-title">
              {en ? (
                <>
                  Tailored
                  <br />
                  applications.
                  <br />
                  <span>
                    Your private
                    <br />
                    cloud.
                  </span>
                </>
              ) : (
                <>
                  Vos applications
                  <br />
                  sur mesure.
                  <br />
                  <span>
                    Votre cloud
                    <br />
                    privé.
                  </span>
                </>
              )}
            </h1>
            <p className="hero-description">
              {applicationService.description[lang]}
            </p>
            <div className="hero-actions">
              <a className="button" href="#contact">
                {t('Parlons de votre projet', 'Let’s talk about your project')}
                <ArrowUpRight size={18} />
              </a>
              <a className="text-link" href="#projects">
                {t('Découvrir nos réalisations', 'Explore our work')}
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
                  {t('références grands comptes', 'enterprise references')}
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
          className="cloud-teaser wrap"
          aria-labelledby="cloud-teaser-title"
        >
          <div>
            <p className="eyebrow section-kicker">SWIRL CLOUD</p>
            <h2 id="cloud-teaser-title">
              {product.heading[lang]} <span>{product.accent[lang]}</span>
            </h2>
            <p>{product.teaser[lang]}</p>
          </div>
          <div className="cloud-teaser-links">
            <a className="text-link" href={productPath(lang)}>
              {t('Découvrir Swirl Cloud', 'Discover Swirl Cloud')}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a className="text-link" href={resourcesPath(lang)}>
              {t(
                'Nos guides : NIS2, DORA, CRA…',
                'Our guides: NIS2, DORA, CRA…',
              )}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
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
                  <h3>
                    <a className="card-link" href={servicePath(s.id, lang)}>
                      {s.title[lang]}
                    </a>
                  </h3>
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
                  {s.id === 'cloud-ai' && (
                    <a
                      className="text-link service-link"
                      href={productPath(lang)}
                    >
                      {t('Découvrir Swirl Cloud', 'Discover Swirl Cloud')}
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </a>
                  )}
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
                  'Zaïd Chefchaouni, CEO de Swirl',
                  'Zaïd Chefchaouni, CEO of Swirl',
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
                    "La perfection s'accomplit dans la simplicité.",
                    'Perfection is achieved in simplicity.',
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
                'We value simple solutions, clear communication, and lasting partnerships.',
              )}
            </p>
            <p>
              {t(
                'Swirl s’appuie sur une expérience technique acquise depuis 2013 dans la banque, l’assurance, l’énergie, l’industrie et les services. Architecture logicielle et urbanisation du système d’information : nous relions applications web, systèmes embarqués, cloud et IA avec une même exigence de qualité et de fiabilité.',
                'Swirl draws on technical experience built since 2013 across banking, insurance, energy, industry, and services. Our software and enterprise architecture work connects web applications, embedded systems, cloud, and AI with the same commitment to quality and reliability.',
              )}
            </p>
            <ul className="values">
              {[
                t(
                  'Des choix techniques expliqués, documentés et durables.',
                  'Clear, documented technical decisions that stand the test of time.',
                ),
                t(
                  'Une implication concrète, de la conception à la production.',
                  'Hands-on involvement, from design to production.',
                ),
                t(
                  'Du partage, des revues de code et de la transmission.',
                  'Knowledge sharing, code reviews, and mentoring.',
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
