import type { Lang } from '@/data/portfolio';
import type { CaseStudyView } from '@/data/project-view';

export default function ProjectCaseStudy({
  lang,
  caseStudy,
}: Readonly<{ lang: Lang; caseStudy: CaseStudyView }>) {
  const en = lang === 'en';
  const sections = [
    { title: en ? 'The need' : 'Le besoin', text: caseStudy.need },
    {
      title: en ? 'Our contribution' : 'Notre contribution',
      text: caseStudy.contribution,
    },
    { title: en ? 'The solution' : 'La solution', text: caseStudy.solution },
  ];
  return (
    <div className="project-case-study">
      {sections.map(({ title, text }) => (
        <section key={title}>
          <h3>{title}</h3>
          <p>{text}</p>
        </section>
      ))}
    </div>
  );
}
