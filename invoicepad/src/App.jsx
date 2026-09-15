import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "invoicepad-draft-v1";

const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "CAD", symbol: "CA$" },
  { code: "AUD", symbol: "A$" },
];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function emptyLine() {
  return { id: crypto.randomUUID(), description: "", qty: "1", price: "" };
}

function defaultDraft() {
  return {
    kind: "invoice",
    fromName: "",
    fromDetails: "",
    toName: "",
    toDetails: "",
    number: "001",
    issueDate: todayISO(),
    dueDate: "",
    currency: "USD",
    taxPercent: "",
    notes: "",
    terms: "",
    lines: [emptyLine(), emptyLine()],
    paste: "",
  };
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultDraft();
    return { ...defaultDraft(), ...JSON.parse(raw), paste: "" };
  } catch {
    return defaultDraft();
  }
}

function parsePaste(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.includes("\t")
      ? trimmed.split("\t")
      : trimmed.includes("|")
        ? trimmed.split("|")
        : trimmed.split(",");
    const cells = parts.map((p) => p.trim());
    if (!cells.length) continue;
    let description = cells[0] || "";
    let qty = "1";
    let price = "";
    if (cells.length === 2) {
      price = cells[1].replace(/[^0-9.-]/g, "");
    } else if (cells.length >= 3) {
      qty = cells[1].replace(/[^0-9.-]/g, "") || "1";
      price = cells[2].replace(/[^0-9.-]/g, "");
    }
    rows.push({
      id: crypto.randomUUID(),
      description,
      qty,
      price,
    });
  }
  return rows;
}

function money(n, symbol) {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n).toFixed(2);
  return n < 0 ? `-${symbol}${abs}` : `${symbol}${abs}`;
}

function Header({ onHome }) {
  return (
    <header className="top no-print">
      <button className="mark" type="button" onClick={onHome}>
        Invoicepad
      </button>
      <span className="price-chip">$9 one-time</span>
    </header>
  );
}

function Landing({ onStart }) {
  return (
    <main className="page land no-print">
      <p className="eyebrow">Fieldbench · a print tool</p>
      <h1>Paste the lines. Print the invoice.</h1>
      <p className="lede">
        $9 once. Offline in the browser. Not accounting software.
      </p>
      <ul className="honest">
        <li>Invoice or quote. From, to, number, dates, currency, optional tax %.</li>
        <li>Line items stay on this device (localStorage only).</li>
        <li>Print PDF is the browser print dialog. No server.</li>
        <li>Not QuickBooks. Not a subscription. Not tax filing.</li>
      </ul>
      <div className="cta-row">
        <button className="btn primary" type="button" onClick={onStart}>
          Make an invoice
        </button>
      </div>
      <p className="fine">
        App is not paywalled. $9 once is the list price when you buy from the
        storefront.
      </p>
    </main>
  );
}

function Editor({ draft, setDraft, onPrint, onCsv, onClear }) {
  const currency = CURRENCIES.find((c) => c.code === draft.currency) || CURRENCIES[0];
  const symbol = currency.symbol;

  const totals = useMemo(() => {
    let subtotal = 0;
    for (const line of draft.lines) {
      const qty = Number(line.qty);
      const price = Number(line.price);
      if (Number.isFinite(qty) && Number.isFinite(price)) subtotal += qty * price;
    }
    const taxPct = Number(draft.taxPercent);
    const tax =
      Number.isFinite(taxPct) && taxPct > 0 ? (subtotal * taxPct) / 100 : 0;
    return { subtotal, tax, total: subtotal + tax };
  }, [draft.lines, draft.taxPercent]);

  function update(field, value) {
    setDraft((d) => ({ ...d, [field]: value }));
  }

  function updateLine(id, field, value) {
    setDraft((d) => ({
      ...d,
      lines: d.lines.map((l) => (l.id === id ? { ...l, [field]: value } : l)),
    }));
  }

  function addLine() {
    setDraft((d) => ({ ...d, lines: [...d.lines, emptyLine()] }));
  }

  function removeLine(id) {
    setDraft((d) => ({
      ...d,
      lines: d.lines.length <= 1 ? d.lines : d.lines.filter((l) => l.id !== id),
    }));
  }

  function applyPaste() {
    const rows = parsePaste(draft.paste);
    if (!rows.length) return;
    setDraft((d) => ({
      ...d,
      lines: rows,
      paste: "",
    }));
  }

  const label = draft.kind === "quote" ? "Quote" : "Invoice";

  return (
    <>
      <main className="page editor no-print">
        <h1>Paste the lines. Print the invoice.</h1>
        <p className="lede tight">
          $9 once. Offline in the browser. Not accounting software.
        </p>

        <div className="kind-toggle" role="group" aria-label="Document type">
          <button
            type="button"
            className={draft.kind === "invoice" ? "seg on" : "seg"}
            onClick={() => update("kind", "invoice")}
          >
            Invoice
          </button>
          <button
            type="button"
            className={draft.kind === "quote" ? "seg on" : "seg"}
            onClick={() => update("kind", "quote")}
          >
            Quote
          </button>
        </div>

        <div className="grid-2">
          <label className="field">
            From
            <input
              value={draft.fromName}
              onChange={(e) => update("fromName", e.target.value)}
              placeholder="Your name or business"
            />
            <textarea
              className="details"
              rows={3}
              value={draft.fromDetails}
              onChange={(e) => update("fromDetails", e.target.value)}
              placeholder="Address, email, phone"
            />
          </label>
          <label className="field">
            To
            <input
              value={draft.toName}
              onChange={(e) => update("toName", e.target.value)}
              placeholder="Client name"
            />
            <textarea
              className="details"
              rows={3}
              value={draft.toDetails}
              onChange={(e) => update("toDetails", e.target.value)}
              placeholder="Client address or email"
            />
          </label>
        </div>

        <div className="grid-4">
          <label className="field">
            {label} #
            <input
              value={draft.number}
              onChange={(e) => update("number", e.target.value)}
            />
          </label>
          <label className="field">
            Issue date
            <input
              type="date"
              value={draft.issueDate}
              onChange={(e) => update("issueDate", e.target.value)}
            />
          </label>
          <label className="field">
            {draft.kind === "quote" ? "Valid until" : "Due date"}
            <input
              type="date"
              value={draft.dueDate}
              onChange={(e) => update("dueDate", e.target.value)}
            />
          </label>
          <label className="field">
            Currency
            <select
              value={draft.currency}
              onChange={(e) => update("currency", e.target.value)}
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          Paste lines
          <span className="hint">
            One per line: description, qty, price — comma, tab, or | separated
          </span>
          <textarea
            rows={4}
            value={draft.paste}
            onChange={(e) => update("paste", e.target.value)}
            placeholder={"Design work, 8, 75\nHosting | 1 | 20"}
            spellCheck="false"
          />
        </label>
        <div className="cta-row tight">
          <button
            className="btn ghost"
            type="button"
            disabled={!draft.paste.trim()}
            onClick={applyPaste}
          >
            Use pasted lines
          </button>
        </div>

        <div className="lines-head">
          <h2>Line items</h2>
          <button className="btn ghost small" type="button" onClick={addLine}>
            Add line
          </button>
        </div>
        <div className="lines">
          {draft.lines.map((line) => {
            const qty = Number(line.qty);
            const price = Number(line.price);
            const amount =
              Number.isFinite(qty) && Number.isFinite(price) ? qty * price : NaN;
            return (
              <div className="line-row" key={line.id}>
                <input
                  className="desc"
                  value={line.description}
                  onChange={(e) =>
                    updateLine(line.id, "description", e.target.value)
                  }
                  placeholder="Description"
                />
                <input
                  className="qty"
                  inputMode="decimal"
                  value={line.qty}
                  onChange={(e) => updateLine(line.id, "qty", e.target.value)}
                  placeholder="Qty"
                  aria-label="Quantity"
                />
                <input
                  className="price"
                  inputMode="decimal"
                  value={line.price}
                  onChange={(e) => updateLine(line.id, "price", e.target.value)}
                  placeholder="Price"
                  aria-label="Unit price"
                />
                <span className="amount">{money(amount, symbol)}</span>
                <button
                  className="icon-btn"
                  type="button"
                  onClick={() => removeLine(line.id)}
                  aria-label="Remove line"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>

        <div className="grid-2">
          <label className="field">
            Tax % <span className="hint">(optional)</span>
            <input
              inputMode="decimal"
              value={draft.taxPercent}
              onChange={(e) => update("taxPercent", e.target.value)}
              placeholder="0"
            />
          </label>
          <div className="totals-card">
            <div>
              <span>Subtotal</span>
              <strong>{money(totals.subtotal, symbol)}</strong>
            </div>
            <div>
              <span>Tax</span>
              <strong>{money(totals.tax, symbol)}</strong>
            </div>
            <div className="grand">
              <span>Total</span>
              <strong>{money(totals.total, symbol)}</strong>
            </div>
          </div>
        </div>

        <div className="grid-2">
          <label className="field">
            Notes
            <textarea
              rows={3}
              value={draft.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Thank-you line, deposit note…"
            />
          </label>
          <label className="field">
            Terms
            <textarea
              rows={3}
              value={draft.terms}
              onChange={(e) => update("terms", e.target.value)}
              placeholder="Payment terms, validity…"
            />
          </label>
        </div>

        <div className="cta-row">
          <button className="btn primary" type="button" onClick={onPrint}>
            Print PDF
          </button>
          <button className="btn ghost" type="button" onClick={onCsv}>
            Export lines CSV
          </button>
          <button className="btn ghost" type="button" onClick={onClear}>
            Clear draft
          </button>
        </div>
        <p className="fine">
          Draft autosaves in localStorage. Print opens the browser dialog — choose
          Save as PDF.
        </p>
      </main>

      <PrintSheet draft={draft} totals={totals} symbol={symbol} label={label} />
    </>
  );
}

function PrintSheet({ draft, totals, symbol, label }) {
  return (
    <section className="sheet" aria-label={`${label} preview`}>
      <div className="sheet-top">
        <div>
          <p className="sheet-kind">{label}</p>
          <h2 className="sheet-title">
            {draft.fromName || "Your name"} · {label} #{draft.number || "—"}
          </h2>
        </div>
        <div className="sheet-meta">
          <div>
            <span>Issued</span>
            <strong>{draft.issueDate || "—"}</strong>
          </div>
          {(draft.dueDate || draft.kind === "quote") && (
            <div>
              <span>{draft.kind === "quote" ? "Valid until" : "Due"}</span>
              <strong>{draft.dueDate || "—"}</strong>
            </div>
          )}
          <div>
            <span>Currency</span>
            <strong>{draft.currency}</strong>
          </div>
        </div>
      </div>

      <div className="sheet-parties">
        <div>
          <h3>From</h3>
          <p className="party-name">{draft.fromName || "—"}</p>
          <pre className="party-details">{draft.fromDetails || ""}</pre>
        </div>
        <div>
          <h3>Bill to</h3>
          <p className="party-name">{draft.toName || "—"}</p>
          <pre className="party-details">{draft.toDetails || ""}</pre>
        </div>
      </div>

      <table className="sheet-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {draft.lines
            .filter((l) => l.description.trim() || l.price !== "")
            .map((line) => {
              const qty = Number(line.qty);
              const price = Number(line.price);
              const amount =
                Number.isFinite(qty) && Number.isFinite(price)
                  ? qty * price
                  : NaN;
              return (
                <tr key={line.id}>
                  <td>{line.description || "—"}</td>
                  <td>{line.qty || "—"}</td>
                  <td>{money(price, symbol)}</td>
                  <td>{money(amount, symbol)}</td>
                </tr>
              );
            })}
        </tbody>
      </table>

      <div className="sheet-totals">
        <div>
          <span>Subtotal</span>
          <strong>{money(totals.subtotal, symbol)}</strong>
        </div>
        {Number(draft.taxPercent) > 0 && (
          <div>
            <span>Tax ({draft.taxPercent}%)</span>
            <strong>{money(totals.tax, symbol)}</strong>
          </div>
        )}
        <div className="grand">
          <span>Total</span>
          <strong>{money(totals.total, symbol)}</strong>
        </div>
      </div>

      {(draft.notes.trim() || draft.terms.trim()) && (
        <div className="sheet-notes">
          {draft.notes.trim() && (
            <div>
              <h3>Notes</h3>
              <p>{draft.notes}</p>
            </div>
          )}
          {draft.terms.trim() && (
            <div>
              <h3>Terms</h3>
              <p>{draft.terms}</p>
            </div>
          )}
        </div>
      )}

      <p className="sheet-foot">
        Invoicepad · Fieldbench · printed locally · not accounting software
      </p>
    </section>
  );
}

export default function App() {
  const [view, setView] = useState("land");
  const [draft, setDraft] = useState(loadDraft);

  useEffect(() => {
    try {
      const { paste, ...rest } = draft;
      void paste;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch {
      /* quota / private mode */
    }
  }, [draft]);

  function exportCsv() {
    const rows = [
      ["description", "qty", "price", "amount"],
      ...draft.lines.map((l) => {
        const qty = Number(l.qty);
        const price = Number(l.price);
        const amount =
          Number.isFinite(qty) && Number.isFinite(price) ? qty * price : "";
        return [l.description, l.qty, l.price, amount];
      }),
    ];
    const csv = rows
      .map((r) =>
        r
          .map((cell) => {
            const s = String(cell ?? "");
            return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${draft.kind}-${draft.number || "lines"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="shell">
      <Header onHome={() => setView("land")} />
      {view === "land" && <Landing onStart={() => setView("edit")} />}
      {view === "edit" && (
        <Editor
          draft={draft}
          setDraft={setDraft}
          onPrint={() => window.print()}
          onCsv={exportCsv}
          onClear={() => {
            localStorage.removeItem(STORAGE_KEY);
            setDraft(defaultDraft());
          }}
        />
      )}
      <footer className="foot no-print">
        Invoicepad · Fieldbench · $9 one-time · no account · localStorage only
      </footer>
    </div>
  );
}
