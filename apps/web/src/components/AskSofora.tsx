import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAction } from "convex/react";
import { Link, useLocation } from "react-router";
import { api } from "../../../../convex/_generated/api";
import { useWebsite } from "../data/WebsiteContent";

type Reply = {
  answer: string;
  links: { title: string; path: string }[];
  handoff: boolean;
  whatsapp: string | null;
};
type Exchange = { question: string; reply?: Reply };

const prompts = [
  ["Find a loan", "What types of loans does Sofora offer?"],
  ["Join Sofora", "How do I join Sofora?"],
  ["Find a form", "Which application forms are available?"],
  ["Get directions", "Where is Sofora's office? Can I get directions?"],
] as const;

export function AskSofora() {
  const ask = useAction(api.askSofora.answer);
  const { pathname } = useLocation();
  const { contact } = useWebsite();
  const phone = contact.phones.find((number) => /^\+?[\d\s()-]+$/.test(number))?.replace(/[^+\d]/g, "");
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const launcher = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const transcript = useRef<HTMLDivElement>(null);
  const pending = exchanges.at(-1)?.reply === undefined && exchanges.length > 0;

  useEffect(() => {
    if (open) input.current?.focus();
  }, [open]);

  useEffect(() => {
    if (transcript.current) transcript.current.scrollTop = transcript.current.scrollHeight;
  }, [open, exchanges]);

  function close(restoreFocus = true) {
    setOpen(false);
    if (restoreFocus) launcher.current?.focus();
  }

  async function send(value: string) {
    const question = value.trim();
    if (!question || pending) return;
    const history = exchanges.slice(-3).flatMap(({ question, reply }) => [
      { role: "user" as const, text: question },
      ...(reply ? [{ role: "assistant" as const, text: reply.answer }] : []),
    ]);
    const recent = exchanges.slice(-9);
    setDraft("");
    setExchanges([...recent, { question }]);
    let reply: Reply;
    try {
      reply = await ask({ question, path: pathname, history });
    } catch {
      reply = {
        answer: "Ask Sofora is unavailable right now. You can search the site or contact Sofora.",
        links: [{ title: "Search Sofora", path: `/?s=${encodeURIComponent(question)}` }],
        handoff: true,
        whatsapp: null,
      };
    }
    setExchanges([...recent, { question, reply }]);
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void send(draft);
  }

  return (
    <div className="ask-sofora" onKeyDown={(event) => {
      if (open && event.key === "Escape") {
        event.stopPropagation();
        close();
      }
    }}>
      {open && (
        <section className="ask-sofora-panel" id="ask-sofora-panel" aria-labelledby="ask-sofora-title">
          <header className="ask-sofora-header">
            <h2 id="ask-sofora-title">Ask Sofora</h2>
            <button type="button" aria-label="Close Ask Sofora" onClick={() => close()}>×</button>
          </header>
          <div className="ask-sofora-transcript" ref={transcript}>
            {!exchanges.length && (
              <>
                <p>How can I help? Ask about loans, membership, forms, or where to find us.</p>
                <div className="ask-sofora-links">
                  {prompts.map(([label, question]) => (
                    <button type="button" key={label} onClick={() => { input.current?.focus(); void send(question); }}>{label}</button>
                  ))}
                </div>
              </>
            )}
            <div className="ask-sofora-messages" role="log" aria-label="Conversation">
              {exchanges.map(({ question, reply }, index) => (
                <div className="ask-sofora-exchange" key={index}>
                  <p className="ask-sofora-question"><span className="sr-only">You: </span>{question}</p>
                  {reply && (
                    <>
                      <p className="ask-sofora-answer"><span className="sr-only">Ask Sofora: </span>{reply.answer}</p>
                      <div className="ask-sofora-links">
                        {reply.links.map(({ title, path }, linkIndex) => path.endsWith(".pdf") || path.startsWith("https://")
                          ? <a key={linkIndex} href={path}>{title}</a>
                          : <Link key={linkIndex} to={path} onClick={() => close(false)}>{title}</Link>,
                        )}
                        {reply.handoff && (
                          <>
                            {phone && <a href={`tel:${phone}`}>Call Sofora</a>}
                            {reply.whatsapp && <a href={`https://wa.me/${reply.whatsapp}`}>WhatsApp Sofora</a>}
                            <Link to="/contact-us/" onClick={() => close(false)}>Contact Sofora</Link>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
              {pending && <p className="ask-sofora-wait">Finding an answer…</p>}
            </div>
          </div>
          <form className="ask-sofora-form" onSubmit={submit}>
            <p id="ask-sofora-note">Ask about public information. Leave out personal details.</p>
            <div>
              <label className="sr-only" htmlFor="ask-sofora-question">Your question</label>
              <input id="ask-sofora-question" ref={input} value={draft} maxLength={500}
                onChange={(event) => setDraft(event.target.value)} placeholder="Type your question…"
                aria-describedby="ask-sofora-note" autoComplete="off" />
              <button className="btn btn-small" disabled={!draft.trim() || pending}>Send</button>
            </div>
          </form>
        </section>
      )}
      <button ref={launcher} className="btn ask-sofora-launcher" type="button" aria-expanded={open}
        aria-controls={open ? "ask-sofora-panel" : undefined}
        onClick={() => open ? close() : setOpen(true)}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
          <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H5l1.8-3.2A7.5 7.5 0 1 1 20 11.5Z" />
          <path d="M9 11.5h7m-7 3h4" />
        </svg>
        Ask Sofora
      </button>
    </div>
  );
}
