import { useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Lang } from '@/data/portfolio';
import type { ProjectView } from '@/data/project-view';
import ClientLogo from './ClientLogo';
export default function ProjectGallery({
  lang,
  projects,
}: Readonly<{
  lang: Lang;
  projects: ProjectView[];
}>) {
  const en = lang === 'en';
  const t = (fr: string, eng: string) => (en ? eng : fr);
  const [filter, setFilter] = useState('all');
  const matching = projects.filter(
    (p) => filter === 'all' || p.sector === filter,
  );
  function sectorLabel(sector: string) {
    if (sector === 'finance')
      return t('BANQUE & ASSURANCE', 'BANKING & INSURANCE');
    if (sector === 'energy') return t('ÉNERGIE', 'ENERGY');
    return t('INDUSTRIE & SERVICES', 'INDUSTRY & SERVICES');
  }
  return (
    <section className="projects-section" id="projects">
      <div className="wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow section-kicker">
              02 / {t('RÉFÉRENCES', 'SELECTED WORK')}
            </p>
            <h2>
              {t('Des défis concrets.', 'Real challenges.')}
              <br />
              <span>
                {t('Des projets qui comptent.', 'Projects that matter.')}
              </span>
            </h2>
          </div>
          <p className="section-intro">
            {t(
              'Banque, assurance, énergie, industrie et services : des projets qui simplifient le quotidien et font avancer les entreprises.',
              'Banking, insurance, energy, industry, and services: projects that simplify everyday work and help businesses move forward.',
            )}
          </p>
        </div>
        <fieldset
          className="filters"
          aria-label={t('Filtrer par secteur', 'Filter by sector')}
        >
          {[
            ['all', t('Tous les projets', 'All projects')],
            ['finance', t('Banque & assurance', 'Banking & insurance')],
            ['energy', t('Énergie', 'Energy')],
            ['industry', t('Industrie & services', 'Industry & services')],
          ].map(([value, label]) => (
            <Button
              key={value}
              variant="ghost"
              className={`filter ${filter === value ? 'selected' : ''}`}
              aria-pressed={filter === value}
              onClick={() => {
                setFilter(value);
              }}
            >
              {label}
              {value === 'all' && <span>{projects.length}</span>}
            </Button>
          ))}
        </fieldset>
        <p className="sr-only" aria-live="polite">
          {matching.length} {t('projets trouvés', 'projects found')}
        </p>
        <div className="projects-grid">
          {matching.map((p) => (
            <article className={`project-card ${p.color}`} key={p.id}>
              <div className="project-top">
                <span>{sectorLabel(p.sector)}</span>
                <span>{p.date}</span>
              </div>
              <div className="project-client">
                <ClientLogo id={p.id} />
              </div>
              <div className="project-info">
                <h3>
                  <a className="card-link" href={p.path}>
                    {p.title}
                  </a>
                </h3>
                <p>{p.text}</p>
                <div className="tags">
                  {p.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
