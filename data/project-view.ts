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

// Serialize only the active language into the interactive gallery.
export function projectViews(lang: Lang) {
  return projects.map(
    ({ id, client, sector, date, color, title, text, caseStudy, tags }) => ({
      id,
      client,
      sector,
      date,
      color,
      title: title[lang],
      text: text[lang],
      caseStudy: localizeCaseStudy(caseStudy, lang),
      tags: tags[lang],
      path: projectPath(id, lang),
    }),
  );
}
export type ProjectView = ReturnType<typeof projectViews>[number];
