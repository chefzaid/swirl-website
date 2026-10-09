import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { projects, sectors, services } from '../../../data/portfolio';
import { servicePages } from '../../../data/expertise';
import { product } from '../../../data/product';
import { howItWorks } from '../../../data/how-it-works';
import { security } from '../../../data/security';
import { sovereignty } from '../../../data/sovereignty';
import { comparison } from '../../../data/comparison';
import {
  documentRoutes,
  socialImagePath,
  type DocumentRoute,
} from '../../../data/site';
import { socialCardPng, type SocialCard } from '../../../lib/social-image';

export async function getStaticPaths() {
  return Promise.all(
    documentRoutes.map(async (route) => ({
      params: { image: socialImagePath(route.path).slice('/og/'.length, -4) },
      props: {
        route,
        heading:
          route.page.kind === 'article'
            ? (await getEntry('articles', `${route.lang}/${route.page.id}`))
                ?.data.heading
            : undefined,
      },
    })),
  );
}

// Card copy mirrors each page's H1 so shared links preview what they open.
function card({ page, lang }: DocumentRoute, heading = ''): SocialCard {
  const en = lang === 'en';
  const upper = (text: string) => text.toLocaleUpperCase(lang);
  switch (page.kind) {
    case 'home':
      return {
        eyebrow: en
          ? 'TAILORED SOFTWARE · PRIVATE CLOUD'
          : 'LOGICIEL SUR MESURE · CLOUD PRIVÉ',
        title: en ? 'Tailored applications.' : 'Vos applications sur mesure.',
        accent: en ? 'Your private cloud.' : 'Votre cloud privé.',
        tags: services.map((service) => service.title[lang]),
      };
    case 'service': {
      const index = services.findIndex((service) => service.id === page.id);
      const service = services[index];
      return {
        eyebrow: `0${index + 1} / ${upper(service.title[lang])}`,
        title: servicePages[page.id].heading[lang],
        accent: servicePages[page.id].accent[lang],
        tags: service.tags,
      };
    }
    case 'product':
      return {
        eyebrow: upper(product.name),
        title: product.heading[lang],
        accent: product.accent[lang],
        tags: product.tags,
      };
    case 'product-page': {
      const detail = {
        'how-it-works': howItWorks,
        security,
        sovereignty,
        comparison,
      }[page.id];
      return {
        eyebrow: upper(product.name),
        title: detail.heading[lang],
        accent: detail.accent[lang],
        tags: detail.tags,
      };
    }
    case 'resources':
      return {
        eyebrow: en ? 'RESOURCES' : 'RESSOURCES',
        title: en ? 'Resources.' : 'Ressources.',
        accent: en
          ? 'Rules and practice, checked.'
          : 'Les règles et la pratique, vérifiées.',
        tags: ['NIS2', 'DORA', 'Data Act', 'Factur-X'],
      };
    case 'article':
      return {
        eyebrow: en ? 'RESOURCES · GUIDE' : 'RESSOURCES · GUIDE',
        title: heading,
        tags: [],
      };
    case 'projects':
      return {
        eyebrow: en ? 'SELECTED WORK' : 'RÉFÉRENCES',
        title: en ? 'Case studies.' : 'Études de cas.',
        accent: en ? 'Projects that matter.' : 'Des projets qui comptent.',
        tags: sectors.map((sector) => sector.label[lang]),
      };
    case 'project': {
      const project = projects.find((item) => item.id === page.id)!;
      return {
        eyebrow: upper(
          `${en ? 'Case study' : 'Étude de cas'} · ${project.client} · ${project.date}`,
        ),
        title: project.title[lang],
        tags: project.tags[lang],
      };
    }
    case 'privacy':
      return {
        eyebrow: en ? 'PRIVACY' : 'CONFIDENTIALITÉ',
        title: en
          ? 'Your privacy matters.'
          : 'Vos informations restent privées.',
        tags: [],
      };
  }
}

export const GET: APIRoute = async ({ props }) =>
  new Response(
    new Uint8Array(
      await socialCardPng(
        card(props.route as DocumentRoute, props.heading as string | undefined),
      ),
    ),
    { headers: { 'Content-Type': 'image/png' } },
  );
