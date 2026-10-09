import { MessageCircle, X } from 'lucide-react';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { Lang } from '@/data/portfolio';

// Odoo Live Chat runs in a frame on Odoo's own origin, so this page keeps its
// strict Content Security Policy. Nothing loads until the visitor asks to
// chat; the frame then reports whether its chat window is open
// (swirl-cloud docs/guides/odoo-website.md). Odoo's chat takes a moment to
// start, so a click opens a window of our own at once, replaced by Odoo's
// chat as soon as it is ready.
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
  // The chatbot persona's name (infra/odoo/chat-persona.json).
  agent: string;
}

function Online({ en }: Readonly<{ en: boolean }>) {
  return (
    <span className="chat-status">
      <span className="chat-online" aria-hidden="true" />
      {en ? 'Online' : 'En ligne'}
    </span>
  );
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
  agent,
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
  // Set when the visitor closes our window before Odoo's chat is ready.
  const dismissed = useRef(false);
  const connected = useRef(false);

  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== odoo || event.data?.type !== 'odoo-livechat') return;
      if (event.data.failed) setState('failed');
      else if (event.data.open) setState(dismissed.current ? 'closed' : 'open');
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

  // Open the connection to Odoo as the visitor reaches for the button; no
  // request is made and nothing is stored until they select it.
  const connect = () => {
    if (connected.current) return;
    connected.current = true;
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = odoo;
    document.head.append(link);
  };

  const start = () => {
    dismissed.current = false;
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
      {state === 'loading' && (
        <section
          className="chat-shell"
          aria-label={en ? 'Live chat' : 'Chat en direct'}
        >
          <header>
            <img src="/assets/chloe.svg" alt="" width="36" height="36" />
            <div>
              <strong>{agent}</strong>
              <Online en={en} />
            </div>
            <button
              type="button"
              className="chat-shell-close"
              onClick={() => {
                dismissed.current = true;
                setState('closed');
              }}
              aria-label={en ? 'Close' : 'Fermer'}
            >
              <X size={18} aria-hidden="true" />
            </button>
          </header>
          <output className="chat-shell-body">
            <span className="sr-only">
              {en
                ? `${agent} is joining the chat…`
                : `${agent} rejoint la discussion…`}
            </span>
            <span className="chat-typing" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </output>
        </section>
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
        (state === 'idle' || state === 'closed') && (
          <button
            type="button"
            className="chat-launcher"
            onClick={start}
            onPointerEnter={connect}
            onFocus={connect}
            onTouchStart={connect}
            title={
              en
                ? 'Opens our live chat, hosted by Swirl'
                : 'Ouvre notre chat en direct, hébergé par Swirl'
            }
          >
            <MessageCircle size={20} aria-hidden="true" />
            <span className="chat-launcher-text">
              {en ? 'Chat with us' : 'Discuter avec nous'}
              <Online en={en} />
            </span>
          </button>
        )
      )}
    </>
  );
}
