import {
  ArrowDown,
  ArrowUpRight,
  Lightbulb,
  Blocks,
  ShieldCheck,
  Rocket,
  Monitor,
  Cog,
  Database,
  RotateCcw,
} from 'lucide-react';
import type { Lang } from '@/data/portfolio';

export default function SoftwareLifecycle({ lang }: Readonly<{ lang: Lang }>) {
  const en = lang === 'en';
  const t = (fr: string, english: string) => (en ? english : fr);
  const stages = [
    {
      title: t('Définir l’idée', 'Define the idea'),
      description: t('Comprendre votre besoin.', 'Understand what you need.'),
      Icon: Lightbulb,
    },
    {
      title: t('Concevoir et développer', 'Design and build'),
      description: t(
        'Chaque brique a un rôle. Ensemble, elles créent votre solution.',
        'Each part has a role. Together, they make your solution.',
      ),
      Icon: Blocks,
    },
    {
      title: t('Vérifier que tout fonctionne', 'Check everything works'),
      description: t(
        'Tester chaque brique et l’ensemble.',
        'Test each part and the whole solution.',
      ),
      Icon: ShieldCheck,
    },
    {
      title: t('Mettre en production', 'Deploy to production'),
      description: t(
        'Votre solution est prête à être utilisée.',
        'Your solution is ready to use.',
      ),
      Icon: Rocket,
    },
  ];
  return (
    <figure className="lifecycle-figure" aria-labelledby="lifecycle-title">
      <figcaption className="lifecycle-heading">
        <span>
          {t('VOTRE PROJET, SIMPLEMENT', 'YOUR PROJECT, MADE SIMPLE')}
          <ArrowUpRight size={16} aria-hidden="true" />
        </span>
        <strong id="lifecycle-title">
          {t('De l’idée à la mise en production.', 'From idea to production.')}
        </strong>
      </figcaption>
      <ol className="lifecycle-stages">
        {stages.map(({ title, description, Icon }, i) => (
          <li
            className={`lifecycle-stage lifecycle-stage-${i + 1}`}
            key={title}
          >
            <span className="lifecycle-number" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="lifecycle-stage-content">
              <div className="lifecycle-stage-title">
                <Icon size={19} strokeWidth={1.5} aria-hidden="true" />
                <h3>{title}</h3>
              </div>
              <p>{description}</p>
              {i === 1 && (
                <fieldset
                  className="lifecycle-modules"
                  aria-label={t(
                    'Les trois briques de la solution',
                    'The three building blocks',
                  )}
                >
                  {[
                    { label: t('Interface', 'Interface'), Icon: Monitor },
                    { label: t('Fonctions', 'Features'), Icon: Cog },
                    { label: t('Données', 'Data'), Icon: Database },
                  ].map(({ label, Icon: ModuleIcon }) => (
                    <div className="lifecycle-module" key={label}>
                      <ModuleIcon
                        size={18}
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                      <span>{label}</span>
                    </div>
                  ))}
                </fieldset>
              )}
            </div>
            {i < stages.length - 1 && (
              <ArrowDown
                className="lifecycle-connector"
                size={15}
                strokeWidth={1.4}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
      <div className="lifecycle-feedback">
        <RotateCcw size={14} aria-hidden="true" />
        <span>
          {t(
            'Puis, faire évoluer votre solution.',
            'Then, keep improving your solution.',
          )}
        </span>
      </div>
    </figure>
  );
}
