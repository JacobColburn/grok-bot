import { useRef, useState } from "react";

const STRIPE = "https://buy.stripe.com/aFaaEZ9jDgph7OKh0fb7y00";

const DEMO_ROOMS = [
  { name: "Kitchen", hue: 38 },
  { name: "Living room", hue: 28 },
  { name: "Bedroom", hue: 210 },
  { name: "Bath", hue: 175 },
];

function formatStamp(d = new Date()) {
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDay(d = new Date()) {
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function makeDemoPhoto(label, hue, stamp) {
  const c = document.createElement("canvas");
  c.width = 1200;
  c.height = 800;
  const ctx = c.getContext("2d");
  ctx.fillStyle = `hsl(${hue} 18% 78%)`;
  ctx.fillRect(0, 0, 1200, 800);
  ctx.fillStyle = `hsl(${hue} 12% 62%)`;
  ctx.fillRect(0, 0, 1200, 140);
  ctx.fillStyle = `hsl(${hue} 10% 42%)`;
  ctx.fillRect(0, 560, 1200, 240);
  ctx.fillStyle = `hsl(${hue + 20} 25% 88%)`;
  ctx.fillRect(180, 180, 360, 280);
  ctx.strokeStyle = `hsl(${hue} 20% 35%)`;
  ctx.lineWidth = 10;
  ctx.strokeRect(180, 180, 360, 280);
  ctx.fillStyle = `hsl(${hue} 8% 28%)`;
  ctx.fillRect(760, 220, 220, 340);
  ctx.fillStyle = "rgba(20,16,12,0.78)";
  ctx.font = "700 42px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText("DEMO · no camera", 40, 70);
  ctx.font = "600 36px ui-sans-serif, system-ui, sans-serif";
  ctx.fillText(label, 40, 120);
  ctx.fillStyle = "#9c1f12";
  ctx.font = "700 34px ui-monospace, Menlo, monospace";
  ctx.fillText(stamp, 40, 760);
  return c.toDataURL("image/jpeg", 0.82);
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function Buy() {
  return (
    <a
      className="btn buy"
      href={STRIPE}
      target="_blank"
      rel="noopener noreferrer"
    >
      Buy · $4 one-time
    </a>
  );
}

function Header({ onHome }) {
  return (
    <header className="top no-print">
      <button className="mark" type="button" onClick={onHome}>
        Doorlog
      </button>
      <span className="price-chip">$4 one-time</span>
    </header>
  );
}

function Landing({ onWalk, onDemo }) {
  return (
    <main className="page land no-print">
      <p className="eyebrow">Fieldbench · DIY landlord</p>
      <h1>Walk the place. Print a photo PDF.</h1>
      <p className="lede">
        You own the building. Walk the rooms, shoot as you go, print a dated
        photo sheet. $4 once is the price, not a single-print lock.
      </p>
      <ul className="honest">
        <li>Not an inspection.</li>
        <li>Not a tenant app.</li>
        <li>Not a legal record. Not court-ready. Not insurance-ready.</li>
        <li>Photos stay in the browser. Print-to-PDF is the export.</li>
      </ul>
      <div className="cta-row">
        <button className="btn primary" type="button" onClick={onWalk}>
          Start a walk
        </button>
        <button className="btn ghost" type="button" onClick={onDemo}>
          Demo without a camera
        </button>
        <Buy />
      </div>
    </main>
  );
}

function Walk({
  property,
  setProperty,
  rooms,
  addRoom,
  renameRoom,
  removeRoom,
  addPhotos,
  removePhoto,
  onExport,
}) {
  const roomName = useRef(null);

  return (
    <main className="page walk no-print">
      <h1>Walk</h1>
      <label className="field">
        Place
        <input
          value={property}
          onChange={(e) => setProperty(e.target.value)}
          placeholder="Address or unit — for you, not a court"
        />
      </label>
      <form
        className="add-room"
        onSubmit={(e) => {
          e.preventDefault();
          const name = roomName.current.value.trim();
          if (!name) return;
          addRoom(name);
          roomName.current.value = "";
        }}
      >
        <input ref={roomName} placeholder="Room name — kitchen, unit 2 bath…" />
        <button className="btn primary" type="submit">
          Add room
        </button>
      </form>
      {rooms.map((room) => (
        <article className="room" key={room.id}>
          <div className="room-head">
            <input
              className="room-name"
              value={room.name}
              onChange={(e) => renameRoom(room.id, e.target.value)}
            />
            <button
              className="texty"
              type="button"
              onClick={() => removeRoom(room.id)}
            >
              Remove
            </button>
          </div>
          <label className="shoot">
            Shoot / add photos
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              onChange={(e) => {
                addPhotos(room.id, e.target.files);
                e.target.value = "";
              }}
            />
          </label>
          <div className="thumbs">
            {room.photos.map((photo) => (
              <figure key={photo.id}>
                <img src={photo.src} alt={room.name} />
                <figcaption>
                  {photo.stamp}
                  <button
                    className="texty"
                    type="button"
                    onClick={() => removePhoto(room.id, photo.id)}
                  >
                    Drop
                  </button>
                </figcaption>
              </figure>
            ))}
          </div>
        </article>
      ))}
      <div className="cta-row">
        <button
          className="btn primary"
          type="button"
          disabled={!rooms.some((r) => r.photos.length)}
          onClick={onExport}
        >
          Print dated PDF
        </button>
      </div>
    </main>
  );
}

function ExportSheet({ property, rooms, walkedAt, onBack }) {
  const day = formatDay(walkedAt);
  const stamp = formatStamp(walkedAt);
  const photoCount = rooms.reduce((n, r) => n + r.photos.length, 0);

  return (
    <main className="page export">
      <div className="print-toolbar no-print">
        <p>
          Print this page to PDF. The date stamp is on the sheet and on every
          photo. This is not a legal record.
        </p>
        <div className="cta-row">
          <button className="btn primary" type="button" onClick={() => window.print()}>
            Print / Save PDF
          </button>
          <button className="btn ghost" type="button" onClick={onBack}>
            Back to walk
          </button>
          <Buy />
        </div>
      </div>

      <article className="sheet">
        <header className="sheet-head">
          <div>
            <p className="sheet-brand">DOORLOG · DIY LANDLORD</p>
            <h1>{property.trim() || "Untitled place"}</h1>
          </div>
          <div className="date-stamp" aria-label={`Walk date ${day}`}>
            <span>WALK DATE</span>
            <strong>{day}</strong>
            <em>{stamp}</em>
          </div>
        </header>
        <p className="disclaimer">
          Not an inspection. Not a tenant app. Not a legal record. Not
          court-ready. Not insurance-ready. {photoCount} photos
          in {rooms.length} rooms. Photos never left this browser.
        </p>
        {rooms.map((room) => (
          <section className="sheet-room" key={room.id}>
            <h2>{room.name}</h2>
            {room.photos.length === 0 ? (
              <p className="empty">No photos in this room.</p>
            ) : (
              <div className="sheet-grid">
                {room.photos.map((photo) => (
                  <figure key={photo.id}>
                    <div className="shot">
                      <img src={photo.src} alt="" />
                      <span className="shot-date">{photo.stamp}</span>
                    </div>
                    <figcaption>
                      {room.name} · {photo.stamp}
                    </figcaption>
                  </figure>
                ))}
              </div>
            )}
          </section>
        ))}
        <footer className="sheet-foot">
          Doorlog dated {stamp} · not a legal record · $4 one-time
        </footer>
      </article>
    </main>
  );
}

let seq = 1;
const nid = () => `id-${seq++}`;

export default function App() {
  const [view, setView] = useState("land");
  const [property, setProperty] = useState("");
  const [rooms, setRooms] = useState([]);
  const [exportedAt, setExportedAt] = useState(null);

  function addRoom(name) {
    setRooms((rs) => [...rs, { id: nid(), name, photos: [] }]);
  }

  function renameRoom(id, name) {
    setRooms((rs) => rs.map((r) => (r.id === id ? { ...r, name } : r)));
  }

  function removeRoom(id) {
    setRooms((rs) => rs.filter((r) => r.id !== id));
  }

  async function addPhotos(roomId, fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const stamp = formatStamp();
    const photos = [];
    for (const file of files) {
      const src = await fileToDataUrl(file);
      photos.push({ id: nid(), src, stamp, name: file.name });
    }
    setRooms((rs) =>
      rs.map((r) =>
        r.id === roomId ? { ...r, photos: [...r.photos, ...photos] } : r
      )
    );
  }

  function removePhoto(roomId, photoId) {
    setRooms((rs) =>
      rs.map((r) =>
        r.id === roomId
          ? { ...r, photos: r.photos.filter((p) => p.id !== photoId) }
          : r
      )
    );
  }

  function loadDemo() {
    const stamp = formatStamp();
    const demo = DEMO_ROOMS.map((room) => ({
      id: nid(),
      name: room.name,
      photos: [
        {
          id: nid(),
          src: makeDemoPhoto(room.name, room.hue, stamp),
          stamp,
          name: "demo.jpg",
        },
      ],
    }));
    setProperty("1847 County 61 — demo building");
    setRooms(demo);
    setView("walk");
  }

  function goExport() {
    setExportedAt(new Date());
    setView("export");
  }

  return (
    <div className="shell">
      <Header onHome={() => setView("land")} />
      {view === "land" && (
        <Landing onWalk={() => setView("walk")} onDemo={loadDemo} />
      )}
      {view === "walk" && (
        <Walk
          property={property}
          setProperty={setProperty}
          rooms={rooms}
          addRoom={addRoom}
          renameRoom={renameRoom}
          removeRoom={removeRoom}
          addPhotos={addPhotos}
          removePhoto={removePhoto}
          onExport={goExport}
        />
      )}
      {view === "export" && exportedAt && (
        <ExportSheet
          property={property}
          rooms={rooms}
          walkedAt={exportedAt}
          onBack={() => setView("walk")}
        />
      )}
      <footer className="foot no-print">
        Doorlog · Fieldbench · DIY landlord · $4 one-time · no account
      </footer>
    </div>
  );
}
