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
export default function ProjectGallery({
  lang,
  projects,
}: {
  lang: Lang;
  projects: ProjectView[];
}) {
  const en = lang === 'en';
  const t = (fr: string, eng: string) => (en ? eng : fr);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<ProjectView | null>(null);
  const matching = projects.filter(
    (p) => filter === 'all' || p.sector === filter,
  );
  const renderProject = (p: ProjectView) => (
    <article className={`project-card ${p.color}`} key={p.id}>
      <div className="project-top">
        <span>
          {p.sector === 'finance'
            ? t('BANQUE & ASSURANCE', 'BANKING & INSURANCE')
            : p.sector === 'energy'
              ? t('ÉNERGIE', 'ENERGY')
              : t('INDUSTRIE & SERVICES', 'INDUSTRY & SERVICES')}
        </span>
        <span>{p.date}</span>
      </div>
      <div className="project-client">
        {p.client}
        <span className="client-underline" />
      </div>
      <div className="project-info">
        <h3>{p.title}</h3>
        <p>{p.text}</p>
        <div className="tags">
          {p.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <a
          className="project-link"
          data-slot="button"
          href={p.path}
          aria-label={`${t('Découvrir le projet', 'Explore the project')} — ${p.client}`}
          onClick={(event) => {
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
          {t('Découvrir le projet', 'Explore the project')}
          <ArrowUpRight size={17} />
        </a>
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
                'Banque, énergie, industrie : des projets qui simplifient le quotidien et font avancer les entreprises.',
                'Banking, energy, industry: projects that simplify everyday work and help businesses move forward.',
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
            )}
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
              <h3>{t('Le projet', 'The project')}</h3>
              <p>{selected.detail}</p>
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
