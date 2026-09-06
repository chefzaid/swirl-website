import { useEffect, useRef, useState, type SubmitEvent } from 'react';
import { ArrowUpRight, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { Lang } from '@/data/portfolio';
export default function ContactForm({ lang }: { lang: Lang }) {
  const en = lang === 'en';
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>(
    'idle',
  );
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(false);
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
          en
            ? 'The form expired. Please send your message again.'
            : 'Le formulaire a expiré. Vous pouvez renvoyer votre message.',
        );
      }
      if (!response.ok)
        throw new Error(
          result.error === 'rate_limit'
            ? en
              ? 'Too many requests. Please try again later or email contact@swirlit.dev.'
              : 'Trop de demandes. Réessayez plus tard ou écrivez à contact@swirlit.dev.'
            : result.error === 'too_fast'
              ? en
                ? 'Please wait a moment, then send again.'
                : 'Patientez un instant, puis réessayez.'
              : en
                ? 'Your message could not be saved. Please try again or email contact@swirlit.dev.'
                : 'Votre message n’a pas pu être enregistré. Réessayez ou écrivez à contact@swirlit.dev.',
        );
      setNotification(result.notified === true);
      setState('success');
      form.reset();
    } catch (e) {
      setError(
        e instanceof Error && e.name !== 'TimeoutError'
          ? e.message
          : en
            ? 'Connection interrupted. Please try again; your message will not be duplicated.'
            : 'Connexion interrompue. Réessayez : votre message ne sera pas dupliqué.',
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
            {en ? 'Thank you for reaching out.' : 'Merci pour votre message.'}
          </h3>
          <p>
            {en
              ? 'Your message has been saved.'
              : 'Votre message a bien été enregistré.'}{' '}
            {notification
              ? en
                ? 'An email notification has been sent to Swirl IT.'
                : 'Une notification a été envoyée à Swirl IT.'
              : en
                ? 'You can also contact us directly by email.'
                : 'Vous pouvez aussi nous contacter directement par e-mail.'}
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
            {en ? 'Send another message' : 'Envoyer un autre message'}
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
              {en
                ? 'Please enable JavaScript to use this form, or email contact@swirlit.dev directly.'
                : 'Activez JavaScript pour utiliser ce formulaire, ou écrivez directement à contact@swirlit.dev.'}
            </p>
          </noscript>
          <div className="form-row">
            <div className="form-field">
              <Label htmlFor="name">
                {en ? 'Your name' : 'Votre nom'} <span>*</span>
              </Label>
              <Input
                id="name"
                name="name"
                autoComplete="name"
                placeholder={en ? 'First and last name' : 'Prénom et nom'}
                required
                minLength={2}
                maxLength={100}
              />
            </div>
            <div className="form-field">
              <Label htmlFor="email">
                {en ? 'Your email' : 'Votre e-mail'} <span>*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="vous@entreprise.com"
                required
                maxLength={254}
              />
            </div>
          </div>
          <div className="form-field">
            <Label htmlFor="subject">
              {en ? 'Subject' : 'Sujet'} <span>*</span>
            </Label>
            <Input
              id="subject"
              name="subject"
              type="text"
              placeholder={
                en
                  ? 'What would you like to discuss?'
                  : 'De quoi souhaitez-vous parler ?'
              }
              required
              minLength={1}
              maxLength={160}
            />
          </div>
          <div className="form-field">
            <Label htmlFor="message">
              {en
                ? 'Tell us about your project'
                : 'Parlez-nous de votre projet'}{' '}
              <span>*</span>
            </Label>
            <Textarea
              id="message"
              name="message"
              rows={5}
              minLength={20}
              maxLength={5000}
              placeholder={
                en
                  ? 'Your context, your challenges, your ideas…'
                  : 'Votre contexte, vos enjeux, vos idées…'
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
              {en
                ? 'I agree that my details may be used to reply to my request.'
                : 'J’accepte que mes informations soient utilisées pour répondre à ma demande.'}
            </span>
          </label>
          <p className="form-privacy">
            <a href={en ? '/en/privacy/' : '/confidentialite/'}>
              {en
                ? 'How we use your information and how to exercise your rights'
                : 'Utilisation de vos informations et exercice de vos droits'}
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
                {en ? 'Sending…' : 'Envoi en cours…'}
              </>
            ) : (
              <>
                {en ? 'Send message' : 'Envoyer le message'}
                <ArrowUpRight size={18} />
              </>
            )}
          </Button>
          <p className="form-note">
            <ShieldCheck size={13} />
            {en
              ? 'Your details stay private. No marketing emails.'
              : 'Vos informations restent privées. Aucun démarchage.'}
          </p>
        </form>
      )}
    </div>
  );
}
