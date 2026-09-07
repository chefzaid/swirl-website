# Fixed-price software development: SEO

Research reviewed on 2026-09-07 for the French-language offer requested by the
site owner. This is an editorial review of supplier terminology, not a keyword
volume study or a legal specification for contracts.

## Positioning

The hero introduction incorporates the fixed-price offer into the existing
message, without adding a paragraph:
« De l’idée à la mise en production, Swirl IT développe vos logiciels sur mesure
au forfait : des solutions fiables, performantes et pensées pour durer. »
The English introduction carries the same message. The expertise introduction
keeps its general description of an end-to-end approach.

This is an editorial recommendation: naming the service in the introduction
makes the offer more concrete, while keeping it to one sentence preserves the
existing layout. [Nielsen Norman Group's research on page visits](https://www.nngroup.com/articles/how-long-do-users-stay-on-web-pages/)
supports communicating the value of a page early; it does not establish that
this particular wording converts better.

This interpretation draws on three suppliers' own descriptions:

- [IGM: modes d’intervention](https://www.igmcentre.fr/mode-intervention/)
  associates a fixed-price project with defined functional/technical requirements,
  an estimate and commitments around delivery. Its own warranties and ownership
  terms are not adopted as Swirl IT promises.
- [Studio HB: cadrage](https://www.studio-hb.com/cadrage) explains how scoping
  turns an expression of needs into the specifications needed for a fixed-price
  project, with visibility into cost, planning and delivery phases.
- [hubera: projet au forfait](https://hubera.fr/nos-prestations/projet-au-forfait/)
  presents the model around an agreed scope, budget, schedule and deliverables.

The offer is mentioned only in the existing hero introduction. There is no
separate offer block, delivery process or scope-change policy. Existing project
references are not labelled as fixed-price contracts. The English copy uses
“fixed price”.

## Search intent and implementation

These are editorial keyword targets, without claimed search volumes or ranking
guarantees:

| Search intent | French wording | Placement |
| --- | --- | --- |
| Find a fixed-price development provider | développement logiciel au forfait | Homepage meta description, supported by the hero introduction |
| Commission custom software | solutions logicielles sur mesure | Homepage title, supported by the hero introduction |
| Build a business-specific tool | logiciels métier | Homepage meta description, supported by the existing web expertise |
| Commission a tailored web application | applications web sur mesure | Homepage meta description, supported by the existing web expertise and introduction |

The hero introduction is shared between server-rendered content and the
fixed-price `Service` description in JSON-LD. Its URL points to `#home`.
The French and English homepage titles/descriptions also populate Open Graph and
Twitter metadata; project and privacy pages keep their specific metadata. The
existing 24 routes, canonical links, language alternates and sitemap still apply.

Homepage titles use the owner's exact wording: « Swirl IT | Solutions logicielles
sur mesure » and “Swirl IT | Tailored Software Solutions”. The brand comes first,
followed by a concise description of the activity. Google accepts the brand at
either end; this ordering is an editorial choice, not a ranking guarantee. The
hero, meta description and structured service still describe fixed-price work.

[Google's supported-meta-tags documentation](https://developers.google.com/search/docs/crawling-indexing/special-tags?hl=fr)
states that `meta keywords` has no effect on Google indexing or ranking. Keywords
are therefore incorporated into useful visible copy and descriptive metadata.
[Google's title guidance](https://developers.google.com/search/docs/appearance/title-link?hl=fr)
recommends descriptive, concise titles without repeated keyword lists, while its
[helpful-content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content?hl=fr)
prioritises content that answers the intended audience's needs. `Service` markup
describes the visible offer; it is not a promise of a special search result.

After publication and recrawling, actual French query impressions and clicks in
Search Console can inform further refinement or a more detailed service page.
