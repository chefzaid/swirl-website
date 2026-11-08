import { projects, type Lang, type Project } from './portfolio';
import { projectPath } from './site';

export function localizeCaseStudy(caseStudy: Project['caseStudy'], lang: Lang) {
  return {
    need: caseStudy.need[lang],
    contribution: caseStudy.contribution[lang],
    solution: caseStudy.solution[lang],
  };
}
export type CaseStudyView = ReturnType<typeof localizeCaseStudy>;

// Serialize only what the cards show, in the active language, into the
// interactive gallery.
export function projectViews(lang: Lang) {
  return projects.map(({ id, sector, date, color, title, text, tags }) => ({
    id,
    sector,
    date,
    color,
    title: title[lang],
    text: text[lang],
    tags: tags[lang],
    path: projectPath(id, lang),
  }));
}
export type ProjectView = ReturnType<typeof projectViews>[number];
