import type { Project } from './portfolio';

interface Logo {
  src: string;
  name: string;
  width: number;
  height: number;
}

export const clientLogos = {
  cacib: [
    { src: 'cacib.svg', name: 'Crédit Agricole CIB', width: 234, height: 28 },
  ],
  enedis: [{ src: 'enedis.svg', name: 'Enedis', width: 127, height: 26 }],
  bpce: [
    { src: 'bpce.png', name: 'Groupe BPCE', width: 1324, height: 501 },
    { src: 'natixis.svg', name: 'Natixis', width: 290, height: 62 },
  ],
  sg: [{ src: 'sg.svg', name: 'Société Générale', width: 147, height: 31 }],
  allianz: [
    { src: 'allianz.svg', name: 'Allianz Trade', width: 249, height: 43 },
  ],
  cdc: [{ src: 'cdc.svg', name: 'Caisse des Dépôts', width: 320, height: 320 }],
  bouygues: [
    {
      src: 'bouygues.svg',
      name: 'Bouygues Construction',
      width: 228,
      height: 117,
    },
  ],
  idemia: [{ src: 'idemia.svg', name: 'IDEMIA', width: 2048, height: 500 }],
  ingenico: [{ src: 'ingenico.svg', name: 'Ingenico', width: 177, height: 50 }],
  engie: [{ src: 'engie.svg', name: 'ENGIE', width: 154, height: 56 }],
} satisfies Record<Project['id'], readonly Logo[]>;
