# Client wordmarks

Client assets are served from `public/assets/clients/` and mapped in
`data/client-logos.ts`. `components/ClientLogo.tsx` renders them across the site.

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

When replacing an asset, update this source list and check its aspect ratio,
contrast and text alternative in `components/ClientLogo.tsx`. Theme rules live in
`styles/sections.css`; keep any transformations compatible with the source artwork.

The Commons sources identify the Caisse des Dépôts and Bouygues marks as
public-domain text/geometry while noting trademark protection. All company
marks remain those of their respective owners.

## Card colours

Each project card's header takes the main colour of the client's colour logo,
not of the monochrome file shown on it. `styles/sections.css` keeps the brand's
OKLCH hue at the site's lightness, with capped chroma: background L 0.34
(C ≤ 0.085) and labels L 0.92 (C ≤ 0.04) in the dark theme, background L 0.86
(C ≤ 0.055) and labels L 0.30 (C ≤ 0.07) in the light theme. Labels stay above
8:1 against their header.

| Client | Logo colour | Taken from |
| --- | --- | --- |
| Crédit Agricole CIB | `#007959` | `cacib.svg` |
| Enedis | `#1423dc` | `enedis.svg` |
| Groupe BPCE, Natixis | `#674175` | `bpce.png` |
| Société Générale | `#e60028` | `sg.svg` |
| Allianz Trade | `#003781` | `allianz.svg` |
| Caisse des Dépôts | `#e30613` | [Commons logo](https://commons.wikimedia.org/wiki/File:Caisse_des_D%C3%A9p%C3%B4ts_et_Consignations_Logo_2022.svg) |
| Bouygues Construction | `#ff661e` | `bouygues.svg` |
| IDEMIA | `#420098` | [Commons logo](https://commons.wikimedia.org/wiki/File:IDEMIA_logo.svg); the 2021 logo is one colour |
| Ingenico | `#00b5d0` | [Commons 2021 logo](https://commons.wikimedia.org/wiki/File:Ingenico_2021_logo.svg), its only colour beside slate grey |
| ENGIE | `#00bdff` | [Commons logo](https://commons.wikimedia.org/wiki/File:Logo-engie.svg) |
