import { clientLogos } from '@/data/client-logos';

export default function ClientLogo({ id }: { id: keyof typeof clientLogos }) {
  return (
    <span className={`client-logo client-logo--${id}`}>
      {clientLogos[id].map((logo) => (
        <img
          key={logo.src}
          src={`/assets/clients/${logo.src}`}
          alt={logo.name}
          width={logo.width}
          height={logo.height}
          loading="lazy"
          decoding="async"
        />
      ))}
    </span>
  );
}
