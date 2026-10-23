import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type SubmitEvent,
} from 'react';
import { ArrowUpRight, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Lang } from '@/data/portfolio';
type Topic = 'project' | 'demo';
// The Swirl Cloud page's "Request a demo" links open the form with ?topic=demo.
// The address does not change while the page is open, so nothing to observe.
const unobserved = () => () => {};
const linkedTopic = (): Topic =>
  new URLSearchParams(window.location.search).get('topic') === 'demo'
    ? 'demo'
    : 'project';
const serverTopic = (): Topic => 'project';
// The privacy link comes as a prop so the island does not bundle the site data.
export default function ContactForm({
  lang,
  privacyHref,
}: Readonly<{ lang: Lang; privacyHref: string }>) {
  const t = (fr: string, en: string) => (lang === 'en' ? en : fr);
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>(
    'idle',
  );
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(false);
  const linked = useSyncExternalStore(unobserved, linkedTopic, serverTopic);
  const [chosen, setTopic] = useState<Topic>();
  const topic = chosen ?? linked;
  const demo = topic === 'demo';
  const started = useRef(0);
  useEffect(() => {
    started.current = Date.now();
  }, []);
  const id = useRef('');
  const fingerprint = useRef('');
  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === 'sending') return;
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const nextFingerprint = JSON.stringify(values);
    if (!id.current || fingerprint.current !== nextFingerprint) {
      id.current = crypto.randomUUID();
      fingerprint.current = nextFingerprint;
    }
    setState('sending');
    setError('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          consent: values.consent === 'on',
          startedAt: started.current,
          id: id.current,
          lang,
        }),
        signal: AbortSignal.timeout(20000),
      });
      const result = (await response.json()) as {
        error?: string;
        notified?: boolean;
      };
      if (result.error === 'expired') {
        started.current = Date.now() - 3000;
        throw new Error(
          t(
            'Le formulaire a expiré. Vous pouvez renvoyer votre message.',
            'The form expired. Please send your message again.',
          ),
        );
      }
      if (!response.ok) {
        const messages: Record<string, string> = {
          rate_limit: t(
            'Trop de demandes. Réessayez plus tard ou écrivez à contact@swirlit.dev.',
            'Too many requests. Please try again later or email contact@swirlit.dev.',
          ),
          too_fast: t(
            'Patientez un instant, puis réessayez.',
            'Please wait a moment, then send again.',
          ),
        };
        throw new Error(
          messages[result.error ?? ''] ??
            t(
              'Votre message n’a pas pu être enregistré. Réessayez ou écrivez à contact@swirlit.dev.',
              'Your message could not be saved. Please try again or email contact@swirlit.dev.',
            ),
        );
      }
      setNotification(result.notified === true);
      setState('success');
      form.reset();
    } catch (e) {
      setError(
        e instanceof Error && e.name !== 'TimeoutError'
          ? e.message
          : t(
              'Connexion interrompue. Réessayez : votre message ne sera pas dupliqué.',
              'Connection interrupted. Please try again; your message will not be duplicated.',
            ),
      );
      setState('error');
    }
  }
  return (
    <div className="contact-form-shell">
      {state === 'success' ? (
        <output className="form-success">
          <CheckCircle2 size={36} />
          <h3>
            {t('Merci pour votre message.', 'Thank you for reaching out.')}
          </h3>
          <p>
            {t(
              'Votre message a bien été enregistré.',
              'Your message has been saved.',
            )}{' '}
            {notification
              ? t(
                  'Une notification a été envoyée à Swirl.',
                  'An email notification has been sent to Swirl.',
                )
              : t(
                  'Vous pouvez aussi nous contacter directement par e-mail.',
                  'You can also contact us directly by email.',
                )}
          </p>
          <a className="text-link" href="mailto:contact@swirlit.dev">
            contact@swirlit.dev <ArrowUpRight size={16} />
          </a>
          <Button
            variant="outline"
            onClick={() => {
              id.current = '';
              started.current = Date.now();
              setState('idle');
            }}
          >
            {t('Envoyer un autre message', 'Send another message')}
          </Button>
        </output>
      ) : (
        <form
          onSubmit={submit}
          method="post"
          action="/api/contact"
          className="contact-form"
        >
          <noscript>
            <p>
              {t(
                'Activez JavaScript pour utiliser ce formulaire, ou écrivez directement à contact@swirlit.dev.',
                'Please enable JavaScript to use this form, or email contact@swirlit.dev directly.',
              )}
            </p>
          </noscript>
          <div className="form-row">
            <div className="form-field">
              <Label htmlFor="name">
                {t('Votre nom', 'Your name')} <span>*</span>
              </Label>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                placeholder={t('Prénom et nom', 'First and last name')}
                required
                minLength={2}
                maxLength={100}
              />
            </div>
            <div className="form-field">
              <Label htmlFor="email">
                {t('Votre e-mail', 'Your email')} <span>*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={t('vous@entreprise.com', 'you@company.com')}
                required
                maxLength={254}
              />
            </div>
          </div>
          <fieldset className="topic-choice">
            <legend>{t('Votre demande', 'Your request')}</legend>
            <div className="topic-options">
              {(['project', 'demo'] as const).map((value) => (
                <label key={value}>
                  <input
                    type="radio"
                    name="topic"
                    value={value}
                    checked={topic === value}
                    onChange={() => setTopic(value)}
                  />
                  {value === 'demo'
                    ? t('Une démo Swirl Cloud', 'A Swirl Cloud demo')
                    : t('Un projet', 'A project')}
                </label>
              ))}
            </div>
          </fieldset>
          {demo ? (
            <div className="form-field">
              <Label htmlFor="company">
                {t('Votre entreprise', 'Your company')} <span>*</span>
              </Label>
              <Input
                id="company"
                name="company"
                autoComplete="organization"
                placeholder={t('Nom de l’entreprise', 'Company name')}
                required
                minLength={2}
                maxLength={140}
              />
            </div>
          ) : (
            <div className="form-field">
              <Label htmlFor="subject">
                {t('Sujet', 'Subject')} <span>*</span>
              </Label>
              <Input
                id="subject"
                name="subject"
                type="text"
                placeholder={t(
                  'De quoi souhaitez-vous parler ?',
                  'What would you like to discuss?',
                )}
                required
                minLength={1}
                maxLength={160}
              />
            </div>
          )}
          <div className="form-field">
            <Label htmlFor="message">
              {demo
                ? t(
                    'Parlez-nous de votre contexte',
                    'Tell us about your context',
                  )
                : t(
                    'Parlez-nous de votre projet',
                    'Tell us about your project',
                  )}{' '}
              <span>*</span>
            </Label>
            <Textarea
              id="message"
              name="message"
              rows={5}
              minLength={20}
              maxLength={5000}
              placeholder={
                demo
                  ? t(
                      'Effectif, applications à héberger, exigences (NIS2, DORA…)',
                      'Headcount, applications to host, requirements (NIS2, DORA…)',
                    )
                  : t(
                      'Votre contexte, vos enjeux, vos idées…',
                      'Your context, your challenges, your ideas…',
                    )
              }
              required
            />
          </div>
          <div className="honeypot" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              id="website"
              name="website"
              type="text"
              autoComplete="off"
              tabIndex={-1}
            />
          </div>
          <label className="consent">
            <input type="checkbox" name="consent" required />
            <span>
              {t(
                'J’accepte que mes informations soient utilisées pour répondre à ma demande.',
                'I agree that my details may be used to reply to my request.',
              )}
            </span>
          </label>
          <p className="form-privacy">
            <a href={privacyHref}>
              {t(
                'Utilisation de vos informations et exercice de vos droits',
                'How we use your information and how to exercise your rights',
              )}
            </a>
          </p>
          <p className="form-error" role="alert">
            {error}
          </p>
          <Button
            className="button submit-button"
            type="submit"
            disabled={state === 'sending'}
          >
            {state === 'sending' ? (
              <>
                <Loader2 size={17} className="spin" />
                {t('Envoi en cours…', 'Sending…')}
              </>
            ) : (
              <>
                {demo
                  ? t('Demander une démo', 'Request a demo')
                  : t('Envoyer le message', 'Send message')}
                <ArrowUpRight size={18} />
              </>
            )}
          </Button>
          <p className="form-note">
            <ShieldCheck size={13} />
            {t(
              'Vos informations restent privées. Aucun démarchage.',
              'Your details stay private. No marketing emails.',
            )}
          </p>
        </form>
      )}
    </div>
  );
}
