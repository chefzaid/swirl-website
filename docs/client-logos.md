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
`app/styles/hero.css`; keep any transformations compatible with the source artwork.

The Commons sources identify the Caisse des Dépôts and Bouygues marks as
public-domain text/geometry while noting trademark protection. All company
marks remain those of their respective owners.
