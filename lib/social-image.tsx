// Build-time renderer for social preview cards and raster icons. Satori turns
// text into SVG paths with the bundled Manrope font, so rasterizing with sharp
// does not depend on fonts installed on the build machine.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';
import { socialImageSize } from '@/data/site';

const fonts = ([500, 700] as const).map((weight) => ({
  name: 'Manrope',
  weight,
  style: 'normal' as const,
  data: readFileSync(
    resolve(
      `node_modules/@fontsource/manrope/files/manrope-latin-${weight}-normal.woff`,
    ),
  ),
}));
const mark = readFileSync(resolve('public/assets/mark.svg'));
const colors = {
  background: '#101211',
  foreground: '#f2f3ed',
  primary: '#d7ee92',
  muted: '#a3aaa5',
  kicker: '#aeb7a9',
  border: '#303632',
};

// The mark is a 300×300 viewBox; oversample before downscaling for crisp edges.
export async function markPng(
  size: number,
  { padding = 0, background }: { padding?: number; background?: string } = {},
) {
  const inner = size - 2 * padding;
  let image = sharp(mark, { density: Math.ceil((72 * inner * 2) / 300) })
    .resize(inner, inner)
    .extend({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
      background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    });
  if (background) image = image.flatten({ background });
  return image.png({ compressionLevel: 9 }).toBuffer();
}

// ICO container holding PNG images, as supported by every current browser.
export async function faviconIco(sizes = [16, 32, 48]) {
  const images = await Promise.all(sizes.map((size) => markPng(size)));
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach((image, index) => {
    const entry = 6 + 16 * index;
    header.writeUInt8(sizes[index] % 256, entry);
    header.writeUInt8(sizes[index] % 256, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(image.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += image.length;
  });
  return Buffer.concat([header, ...images]);
}

export interface SocialCard {
  eyebrow: string;
  title: string;
  accent?: string;
  tags: readonly string[];
}

export async function socialCardPng(card: SocialCard) {
  const icon = `data:image/png;base64,${(await markPng(112, { padding: 16, background: colors.foreground })).toString('base64')}`;
  const length = card.title.length + (card.accent?.length ?? 0);
  const fontSize = length <= 45 ? 76 : length <= 75 ? 64 : 54;
  const svg = await satori(
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '64px 72px',
        fontFamily: 'Manrope',
        color: colors.foreground,
        backgroundColor: colors.background,
        backgroundImage:
          'radial-gradient(circle at 92% 8%, rgba(215, 238, 146, 0.16), rgba(16, 18, 17, 0) 46%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <img
            src={icon}
            alt=""
            width={56}
            height={56}
            style={{ borderRadius: 12 }}
          />
          <div
            style={{
              display: 'flex',
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: -1.5,
            }}
          >
            Swirl<span style={{ color: colors.primary }}>.</span>
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 22, color: colors.muted }}>
          swirlit.dev
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            display: 'flex',
            fontSize: 20,
            letterSpacing: 4,
            color: colors.kicker,
            marginBottom: 26,
          }}
        >
          {card.eyebrow}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize,
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: -2.5,
            maxWidth: 1000,
          }}
        >
          {card.title}
        </div>
        {card.accent && (
          <div
            style={{
              display: 'flex',
              fontSize,
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: -2.5,
              color: colors.primary,
              maxWidth: 1000,
            }}
          >
            {card.accent}
          </div>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          boxSizing: 'border-box',
          gap: 12,
          paddingTop: 28,
          borderTop: `1px solid ${colors.border}`,
          minHeight: 79,
        }}
      >
        {card.tags.map((tag) => (
          <div
            key={tag}
            style={{
              display: 'flex',
              border: '1px solid #354037',
              borderRadius: 6,
              padding: '8px 14px',
              fontSize: 19,
              color: '#c3ccc3',
            }}
          >
            {tag}
          </div>
        ))}
      </div>
    </div>,
    { ...socialImageSize, fonts },
  );
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
