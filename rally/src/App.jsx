import { useMemo, useState } from "react";
import { parseChat } from "./parser.js";
import { SAMPLE_WEEKEND_TRIP } from "./sampleChat.js";

const STRIPE =
  "https://buy.stripe.com/8x200l2Vfdd5glg39pb7y01";

function Header({ onHome }) {
  return (
    <header className="top">
      <button className="mark" type="button" onClick={onHome}>
        Rally
      </button>
      <span className="price-chip">$9 one-time</span>
    </header>
  );
}

function Landing({ onStart, onSample }) {
  return (
    <main className="page land">
      <p className="eyebrow">Fieldbench · a paste tool</p>
      <h1>Paste the chat. Who said they would.</h1>
      <p className="lede">
        Group chats bury the plan. Rally reads the paste in your browser and
        pulls out people, times, places, and who said they would do what.
      </p>
      <ul className="honest">
        <li>Does not run the group.</li>
        <li>Does not ping anyone.</li>
        <li>Does not claim it caught everything.</li>
        <li>Zero signup. Parse stays on this device.</li>
      </ul>
      <div className="cta-row">
        <button className="btn primary" type="button" onClick={onStart}>
          Paste a chat
        </button>
        <button className="btn ghost" type="button" onClick={onSample}>
          Sample weekend-trip group chat
        </button>
        <a
          className="btn buy"
          href={STRIPE}
          target="_blank"
          rel="noopener noreferrer"
        >
          Buy · $9 one-time
        </a>
      </div>
      <p className="fine">
        Heuristic parser. No API keys. Output is labeled EXTRACTED from the
        paste you give it.
      </p>
    </main>
  );
}

function Paste({ chat, setChat, onExtract, onSample }) {
  return (
    <main className="page paste">
      <h1>Paste</h1>
      <p className="lede tight">
        WhatsApp export, iMessage copy, or Name: line format. Nothing leaves
        the browser.
      </p>
      <textarea
        value={chat}
        onChange={(e) => setChat(e.target.value)}
        placeholder="Paste the group chat here…"
        rows={14}
        autoCapitalize="off"
        spellCheck="false"
      />
      <div className="cta-row">
        <button
          className="btn primary"
          type="button"
          disabled={!chat.trim()}
          onClick={onExtract}
        >
          Extract from paste
        </button>
        <button className="btn ghost" type="button" onClick={onSample}>
          Sample weekend-trip group chat
        </button>
      </div>
    </main>
  );
}

function Section({ title, children, empty }) {
  if (empty) return null;
  return (
    <section className="block">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Plan({ chat, plan, onBack }) {
  const stamp = useMemo(() => new Date().toLocaleString(), []);
  return (
    <main className="page plan">
      <div className="extracted-banner" role="status">
        <span className="stamp">EXTRACTED</span>
        <p>
          This plan is EXTRACTED from the paste. It is not a live itinerary. It
          did not catch everything.
        </p>
      </div>
      <p className="meta">
        {plan.messageCount} messages · {plan.people.length} people · pulled {stamp}
      </p>

      <Section title="Who" empty={!plan.people.length}>
        <ul className="pills">
          {plan.people.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </Section>

      <Section title="When" empty={!plan.when.length && !plan.times.length}>
        <ul className="list">
          {plan.when.map((d) => (
            <li key={d}>{d}</li>
          ))}
          {plan.times.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </Section>

      <Section title="Where" empty={!plan.where.length}>
        <ul className="list">
          {plan.where.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      </Section>

      <Section title="Who said they would" empty={!plan.actions.length}>
        <ul className="list">
          {plan.actions.map((a, i) => (
            <li key={i}>
              <strong>{a.who}</strong> — {a.what}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Open questions" empty={!plan.questions.length}>
        <ul className="list">
          {plan.questions.map((q, i) => (
            <li key={i}>
              <strong>{q.who}</strong> — {q.what}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Money mentioned" empty={!plan.money.length}>
        <ul className="pills">
          {plan.money.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </Section>

      <Section title="Sounds like a yes" empty={!plan.decisions.length}>
        <ul className="list">
          {plan.decisions.map((d, i) => (
            <li key={i}>
              <strong>{d.who}</strong> — {d.what}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Bring / pack" empty={!plan.stuff.length}>
        <ul className="list">
          {plan.stuff.map((s, i) => (
            <li key={i}>
              <strong>{s.who}</strong> — {s.what}
            </li>
          ))}
        </ul>
      </Section>

      <details className="raw">
        <summary>Paste this was extracted from</summary>
        <pre>{chat}</pre>
      </details>

      <div className="cta-row">
        <button className="btn ghost" type="button" onClick={onBack}>
          Paste another
        </button>
        <a
          className="btn buy"
          href={STRIPE}
          target="_blank"
          rel="noopener noreferrer"
        >
          Buy · $9 one-time
        </a>
      </div>
    </main>
  );
}

export default function App() {
  const [view, setView] = useState("land");
  const [chat, setChat] = useState("");
  const [plan, setPlan] = useState(null);

  function extract() {
    setPlan(parseChat(chat));
    setView("plan");
  }

  return (
    <div className="shell">
      <Header onHome={() => setView("land")} />
      {view === "land" && (
        <Landing
          onStart={() => setView("paste")}
          onSample={() => {
            setChat(SAMPLE_WEEKEND_TRIP);
            setView("paste");
          }}
        />
      )}
      {view === "paste" && (
        <Paste
          chat={chat}
          setChat={setChat}
          onExtract={extract}
          onSample={() => setChat(SAMPLE_WEEKEND_TRIP)}
        />
      )}
      {view === "plan" && plan && (
        <Plan chat={chat} plan={plan} onBack={() => setView("paste")} />
      )}
      <footer className="foot">
        Rally · Fieldbench · $9 one-time · no account
      </footer>
    </div>
  );
}
