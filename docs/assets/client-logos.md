# Client wordmarks

The reference rows, project cards, dialogs and project pages share
`components/ClientLogo.tsx` and `data/client-logos.ts`. Every logo includes the
company name as artwork and has a text alternative. The files are served locally;
visitors make no requests to the source sites.

Sources retrieved on 2026-09-07:

| Local file under `public/assets/clients/` | Source |
| --- | --- |
| `cacib.svg` | [Crédit Agricole CIB](https://www.ca-cib.com/assets/logo.svg) |
| `enedis.svg` | [Enedis](https://www.enedis.fr/themes/custom/enedis_theme/assets/images/enedis-blueGreen.svg) |
| `bpce.png` | [Groupe BPCE](https://www.groupebpce.com/app/uploads/2024/05/rvb-groupe-bpce-2lignes-bureautique.png) |
| `natixis.svg` | [Natixis CIB website asset](https://static-assets.natixis.simplebo.net/assets/natixis/logo_main-940f981d.svg) |
| `sg.svg` | [Société Générale](https://www.societegenerale.com/themes/custom/sg_refonte/assets/images/logos/logo-simple.svg) |
| `allianz.svg` | [Allianz Trade](https://sign-in.allianz-trade.com/assets/img/allianz_full_logo.svg) |
| `cdc.svg` | [Caisse des Dépôts logo, Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Caisse_des_D%C3%A9p%C3%B4ts_et_Consignations_Logo_2022.svg) |
| `bouygues.svg` | [Bouygues Construction logo, Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Bouygues_Construction_logo.svg) |
| `idemia.svg` | [IDEMIA](https://www.idemia.com/wp-content/themes/idemia/assets/img/idemia-group-logo.svg) |
| `ingenico.svg` | [Ingenico](https://ingenico.com/themes/custom/ingenico/logo.svg) |
| `engie.svg` | [ENGIE](https://www.engie.com/) — inline header SVG |

CSS applies the site's grey/white treatment while preserving aspect ratios.
BPCE/Natixis, Société Générale and Bouygues Construction retain the contrasting
details within their symbols through grayscale/inversion. The Caisse des Dépôts SVG keeps the
original white seal and lettering with its solid red background removed. The
Natixis asset keeps the original symbol and wordmark, without the CIB business-line
descriptor, and trims the surrounding SVG whitespace. Enedis has an explicit
viewBox matching its source dimensions so it scales correctly.

The two Commons source pages identify their logos as public-domain text/geometry
and note trademark protection. All company marks remain those of their respective
owners. They identify the existing project references; the project attribution
continues to describe direct assignments or consulting partnerships.
