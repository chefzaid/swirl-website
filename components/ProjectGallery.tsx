import { useState } from 'react';
import { ArrowUpRight, ArrowRight, Plus, Minus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Lang } from '@/data/portfolio';
import type { ProjectView } from '@/data/project-view';
import ClientLogo from './ClientLogo';
import ProjectCaseStudy from './ProjectCaseStudy';
export default function ProjectGallery({
  lang,
  projects,
  projectsHref,
}: Readonly<{
  lang: Lang;
  projects: ProjectView[];
  // Passed in so the island does not bundle the site's route map.
  projectsHref: string;
}>) {
  const en = lang === 'en';
  const t = (fr: string, eng: string) => (en ? eng : fr);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<ProjectView | null>(null);
  const matching = projects.filter(
    (p) => filter === 'all' || p.sector === filter,
  );
  function sectorLabel(sector: string) {
    if (sector === 'finance')
      return t('BANQUE & ASSURANCE', 'BANKING & INSURANCE');
    if (sector === 'energy') return t('ÉNERGIE', 'ENERGY');
    return t('INDUSTRIE & SERVICES', 'INDUSTRY & SERVICES');
  }
  const renderProject = (p: ProjectView) => (
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
          <a
            className="card-link"
            href={p.path}
            onClick={(event) => {
              // A plain click opens the details here; modified clicks and
              // crawlers follow the link to the case-study page.
              if (
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
              )
                return;
              event.preventDefault();
              setSelected(p);
            }}
          >
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
  );
  return (
    <>
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
            {matching.slice(0, 3).map(renderProject)}
          </div>
          {matching.length > 3 && (
            <details className="more-projects" key={filter}>
              <summary>
                <span className="when-closed">
                  <Plus size={16} aria-hidden="true" />
                  {t(
                    `Voir les ${matching.length} références`,
                    `View all ${matching.length} projects`,
                  )}
                </span>
                <span className="when-open">
                  <Minus size={16} aria-hidden="true" />
                  {t('Réduire la sélection', 'Show fewer projects')}
                </span>
              </summary>
              <div className="projects-grid">
                {matching.slice(3).map(renderProject)}
              </div>
            </details>
          )}
          <p className="client-note">
            {t(
              'Projets réalisés directement ou dans le cadre de partenariats de conseil.',
              'Projects delivered directly or through consulting partnerships.',
            )}{' '}
            <a className="text-link" href={projectsHref}>
              {t('Toutes les études de cas', 'All case studies')}
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </p>
        </div>
      </section>
      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent className="project-dialog">
          {selected && (
            <>
              <DialogClose
                className="dialog-close"
                aria-label={t('Fermer', 'Close')}
              >
                <X size={20} />
              </DialogClose>
              <ClientLogo id={selected.id} />
              <p className="eyebrow section-kicker">
                {selected.client} · {selected.date}
              </p>
              <DialogTitle className="dialog-title">
                {selected.title}
              </DialogTitle>
              <DialogDescription>{selected.text}</DialogDescription>
              <a className="text-link" href={selected.path}>
                {t('Voir la page du projet', 'Open the project page')}{' '}
                <ArrowUpRight size={16} />
              </a>
              <ProjectCaseStudy lang={lang} caseStudy={selected.caseStudy} />
              <div className="tags">
                {selected.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <a
                className="button"
                href="#contact"
                onClick={() => setSelected(null)}
              >
                {t('Un projet similaire ?', 'Planning a similar project?')}
                <ArrowRight size={17} />
              </a>
            </>
          )}
        </DialogContent>
      </Dialog>{' '}
    </>
  );
}
