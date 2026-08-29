const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

const MONTHS =
  "january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec";

const PLACE_HINTS =
  /\b(cabin|airbnb|hotel|house|apartment|apt|airport|trail|park|beach|lake|camp|campsite|downtown|station|depot|marina)\b/i;

const STREET =
  /\b\d{1,5}\s+[A-Z][A-Za-z0-9.'\- ]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Boulevard|Blvd|Way|Court|Ct|County|Hwy|Highway|Pike)\b/;

const ACTION_RE =
  /\b(i(?:['’]?ll| will| can| am going to| am gonna)|let me|gonna|going to|i can)\b\s+(.+)/i;

const DECISION_RE =
  /\b(sounds good|let'?s do(?: it)?|confirmed|we'?re on|deal|that works|i'?m in|ok(?:ay)? split|yes\.|fri-sun yes)\b/i;

const MONEY_RE = /\$\s?\d+(?:,\d{3})*(?:\.\d{2})?(?:\s*\/\s*night)?|~\s*\$?\d+/gi;

function cleanSpeaker(name) {
  return name.replace(/\s+/g, " ").replace(/[~*]+/g, "").trim();
}

function looksLikeClock(s) {
  return /^\d{1,2}:\d{2}/.test(s) || /^(am|pm)$/i.test(s);
}

function splitMessages(raw) {
  const text = String(raw || "").replace(/\r\n/g, "\n");
  const lines = text.split("\n");
  const msgs = [];
  const waBracket = /^\[([^\]]+)\]\s*([^:]+):\s*(.*)$/;
  const waDash =
    /^(\d{1,2}[/. -]\d{1,2}[/. -]\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?)\s*[-–]\s*([^:]+):\s*(.*)$/;
  const simple = /^([A-Za-z][A-Za-z0-9._\- ]{0,40}):\s+(.*)$/;

  let current = null;
  for (const line of lines) {
    let m = line.match(waBracket) || line.match(waDash);
    if (m) {
      if (current) msgs.push(current);
      current = {
        time: m[1].trim(),
        speaker: cleanSpeaker(m[2]),
        text: m[3],
      };
      continue;
    }
    m = line.match(simple);
    if (m && !looksLikeClock(m[1]) && m[1].split(" ").length <= 4) {
      if (current) msgs.push(current);
      current = { time: "", speaker: cleanSpeaker(m[1]), text: m[2] };
      continue;
    }
    if (current) {
      current.text += (current.text ? "\n" : "") + line;
    } else if (line.trim()) {
      current = { time: "", speaker: "Unknown", text: line };
    }
  }
  if (current) msgs.push(current);
  return msgs.filter((x) => x.text && x.text.trim());
}

function uniqueKeepOrder(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = String(item).trim();
    if (!key) continue;
    const folded = key.toLowerCase();
    if (seen.has(folded)) continue;
    seen.add(folded);
    out.push(key);
  }
  return out;
}

function extractDates(blob) {
  const found = [];
  const weekend = /\b(this\s+weekend|next\s+weekend|fri-sun|friday\s*[–-]\s*sunday|sat(?:urday)?\s*[–-]\s*sun(?:day)?)\b/gi;
  const days = new RegExp(
    `\\b(?:this\\s+|next\\s+|on\\s+)?(${WEEKDAYS.join("|")})(?:\\s+morning|\\s+night|\\s+afternoon|\\s+after\\s+work)?\\b`,
    "gi"
  );
  const numeric = /\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b/g;
  const written = new RegExp(
    `\\b(?:${MONTHS})\\s+\\d{1,2}(?:st|nd|rd|th)?(?:,?\\s*\\d{2,4})?\\b`,
    "gi"
  );
  const nth = /\bthe\s+\d{1,2}(?:st|nd|rd|th)\b/gi;
  for (const re of [weekend, days, numeric, written, nth]) {
    const hits = blob.match(re) || [];
    for (const h of hits) found.push(h.replace(/\s+/g, " ").trim());
  }
  return uniqueKeepOrder(found).slice(0, 12);
}

function extractTimes(blob) {
  const re =
    /\b(?:\d{1,2}(?::\d{2})?\s*(?:[ap]m)|after work|in the morning|noon|midnight|out by\s+\d{1,2}(?:\s*[ap]m)?)\b/gi;
  return uniqueKeepOrder((blob.match(re) || []).map((t) => t.trim())).slice(
    0,
    12
  );
}

function extractPlaces(messages) {
  const found = [];
  for (const msg of messages) {
    const t = msg.text;
    const addr = t.match(STREET);
    if (addr) found.push(addr[0].trim());
    const near = t.match(
      /\b(?:near|at|from|in|off|by|to)\s+([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+){0,3})\b/
    );
    if (near) found.push(`${near[0].trim()}`);
    if (PLACE_HINTS.test(t)) {
      const snippet = t.replace(/\s+/g, " ").trim();
      if (snippet.length <= 90) found.push(snippet);
      else {
        const m = t.match(
          /(.{0,24}\b(?:cabin|airbnb|hotel|airport|trail|park|lake|house)\b.{0,32})/i
        );
        if (m) found.push(m[1].replace(/\s+/g, " ").trim());
      }
    }
  }
  return uniqueKeepOrder(found).slice(0, 8);
}

function extractActions(messages) {
  const out = [];
  for (const msg of messages) {
    const line = msg.text.replace(/\s+/g, " ").trim();
    const m = line.match(ACTION_RE);
    if (m) {
      let rest = m[2].replace(/[.?!].*$/, "").trim();
      if (rest.length > 80) rest = rest.slice(0, 77) + "…";
      if (rest) out.push({ who: msg.speaker, what: rest });
    }
  }
  return out.slice(0, 16);
}

function extractQuestions(messages) {
  return messages
    .filter((m) => m.text.includes("?"))
    .map((m) => ({
      who: m.speaker,
      what: m.text.replace(/\s+/g, " ").trim(),
    }))
    .slice(0, 12);
}

function extractMoney(blob) {
  return uniqueKeepOrder(blob.match(MONEY_RE) || []).slice(0, 8);
}

function extractDecisions(messages) {
  return messages
    .filter((m) => DECISION_RE.test(m.text))
    .map((m) => ({
      who: m.speaker,
      what: m.text.replace(/\s+/g, " ").trim(),
    }))
    .slice(0, 10);
}

function extractStuff(messages) {
  const stuff = [];
  const re =
    /\b(?:bring(?:ing)?|pack(?:ing)?|grocer(?:y|ies)|list:|coffee|towels?|speaker|bedding|sleeping bag)\b/i;
  for (const m of messages) {
    if (re.test(m.text)) {
      stuff.push({
        who: m.speaker,
        what: m.text.replace(/\s+/g, " ").trim(),
      });
    }
  }
  return stuff.slice(0, 12);
}

export function parseChat(raw) {
  const messages = splitMessages(raw);
  const blob = messages.map((m) => m.text).join("\n");
  const people = uniqueKeepOrder(
    messages.map((m) => m.speaker).filter((s) => s && s !== "Unknown")
  );
  return {
    messageCount: messages.length,
    people,
    when: extractDates(blob),
    times: extractTimes(blob),
    where: extractPlaces(messages),
    actions: extractActions(messages),
    questions: extractQuestions(messages),
    money: extractMoney(blob),
    decisions: extractDecisions(messages),
    stuff: extractStuff(messages),
    messages,
  };
}
