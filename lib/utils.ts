import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Lang } from '@/data/portfolio';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// A date as written in each language: "October 23, 2026", "23 octobre 2026".
export function longDate(value: Date, lang: Lang) {
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'fr-FR', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(value);
}
