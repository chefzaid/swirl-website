declare module 'virtual:swirl-pages' {
  const pages: Record<string, string>;
  export default pages;
  export const notFound: Record<'fr' | 'en', string>;
}
