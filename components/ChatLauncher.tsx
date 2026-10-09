import { LoaderCircle, MessageCircle, X } from 'lucide-react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { Lang } from '@/data/portfolio';

// Odoo Live Chat runs in a frame on Odoo's own origin, so this page keeps its
// strict Content Security Policy. Nothing loads until the visitor asks to
// chat; the frame then reports whether its chat window is open
// (swirl-cloud docs/guides/odoo-website.md).
const STARTED = 'swirl-chat-started';
const TIMEOUT_MS = 20_000;

type State = 'idle' | 'loading' | 'open' | 'closed' | 'failed';

// Values come from the page as props: importing the site data here would
// bundle all of its portfolio content into this island.
interface Props {
  lang: Lang;
  odooOrigin: string;
  channelId: number;
  contactHref: string;
}

function rememberStarted(): void {
  try {
    sessionStorage.setItem(STARTED, '1');
  } catch {
    // Without storage, later pages simply show the button again.
  }
}

const noSubscription = () => () => {};

function wasStarted(): boolean {
  try {
    return sessionStorage.getItem(STARTED) === '1';
  } catch {
    return false;
  }
}

export default function ChatLauncher({
  lang,
  odooOrigin: odoo,
  channelId,
  contactHref,
}: Readonly<Props>) {
  const en = lang === 'en';
  const chatUrl = `${odoo}/platform_crm_intake/chat/${channelId}?lang=${lang}`;
  const [state, setState] = useState<State>('idle');
  const [requested, setRequested] = useState<string>();
  // On later pages of the same tab, restore a conversation the visitor left
  // open; Odoo reopens it only if it was open. Pages render without it.
  const resume = useSyncExternalStore(noSubscription, wasStarted, () => false);
  const src = requested ?? (resume ? chatUrl : undefined);
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== odoo || event.data?.type !== 'odoo-livechat') return;
      if (event.data.failed) setState('failed');
      else if (event.data.open) setState('open');
      // The frame reports "closed" before Odoo has opened a requested chat.
      else setState((current) => (current === 'loading' ? current : 'closed'));
    };
    window.addEventListener('message', receive);
    return () => window.removeEventListener('message', receive);
  }, [odoo]);

  useEffect(() => {
    if (state !== 'loading') return;
    const timer = setTimeout(() => setState('failed'), TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [state]);

  const start = () => {
    setState('loading');
    rememberStarted();
    if (src)
      frame.current?.contentWindow?.postMessage(
        { type: 'odoo-livechat-open' },
        odoo,
      );
    else setRequested(`${chatUrl}&open=1`);
  };

  return (
    <>
      {src && (
        <iframe
          ref={frame}
          className="chat-frame"
          src={src}
          title={en ? 'Live chat' : 'Chat en direct'}
          hidden={state !== 'open'}
          allow="clipboard-write"
        />
      )}
      {state === 'failed' ? (
        <output className="chat-launcher chat-failed">
          {en
            ? 'Chat is unavailable right now. '
            : 'Le chat est indisponible pour le moment. '}
          <a href={contactHref}>
            {en ? 'Write to us instead.' : 'Écrivez-nous plutôt.'}
          </a>
          <button
            type="button"
            className="chat-dismiss"
            onClick={() => setState('closed')}
            aria-label={en ? 'Dismiss' : 'Fermer'}
          >
            <X size={14} aria-hidden="true" />
          </button>
        </output>
      ) : (
        state !== 'open' && (
          <button
            type="button"
            className="chat-launcher"
            onClick={start}
            disabled={state === 'loading'}
            aria-busy={state === 'loading'}
            title={
              en
                ? 'Opens our live chat, hosted by Swirl'
                : 'Ouvre notre chat en direct, hébergé par Swirl'
            }
          >
            {state === 'loading' ? (
              <LoaderCircle
                size={18}
                aria-hidden="true"
                className="chat-spin"
              />
            ) : (
              <MessageCircle size={18} aria-hidden="true" />
            )}
            {en ? 'Chat with us' : 'Discuter avec nous'}
          </button>
        )
      )}
    </>
  );
}
