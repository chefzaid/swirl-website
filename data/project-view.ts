import { projects, type Lang } from './portfolio';
import { projectPath } from './site';

// Serialize only the active language into the interactive gallery.
export function projectViews(lang: Lang) {
  return projects.map(
    ({ id, client, sector, date, color, title, text, detail, tags }) => ({
      id,
      client,
      sector,
      date,
      color,
      title: title[lang],
      text: text[lang],
      detail: detail[lang],
      tags: tags[lang],
      path: projectPath(id, lang),
    }),
  );
}
export type ProjectView = ReturnType<typeof projectViews>[number];
