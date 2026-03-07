import { useState, useEffect, useRef } from "react";
import { getTimeZones } from "@vvo/tzdb";

const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap";
document.head.appendChild(link);

const TIMEZONES = getTimeZones()
  .flatMap(z => z.mainCities.map(city => ({ city, tz: z.name, country: z.countryCode })))
  .sort((a, b) => a.city.localeCompare(b.city));

const DEFAULT_CITIES = [
  { city: "New York",    tz: "America/New_York",    country: "US" },
  { city: "London",      tz: "Europe/London",       country: "GB" },
  { city: "Tokyo",       tz: "Asia/Tokyo",          country: "JP" },
  { city: "Sydney",      tz: "Australia/Sydney",    country: "AU" },
  { city: "Los Angeles", tz: "America/Los_Angeles", country: "US" },
];

// Brand palette
const C = {
  red:    "#E30613",
  white:  "#FFFFFF",
  blue:   "#109FCC",
  purple: "#5A205B",
  yellow: "#F7C917",
  green:  "#36AD34",
};

// Time of day → card style
// light: true = dark text, false = light text
function getBg(h) {
  if (h < 4)   return { bg: [C.purple, "#2d0f2e"],  text: "#c080c2", light: false, label: "Night" };
  if (h < 8)   return { bg: [C.red,    "#8B0010"],  text: "#ffb0b0", light: false, label: "Early morning" };
  if (h < 12)  return { bg: [C.yellow, "#fde96a"],  text: "#4a3800", light: true,  label: "Morning" };
  if (h < 16)  return { bg: [C.green,  "#5acc58"],  text: "#0d3a0c", light: true,  label: "Early afternoon" };
  if (h < 20)  return { bg: [C.blue,   "#0a5a7a"],  text: "#b0e0ff", light: false, label: "Afternoon" };
  return        { bg: [C.purple, "#2d0f2e"],         text: "#c080c2", light: false, label: "Night" };
}

function getTimeInZone(tz, offsetMs) {
  const now = new Date(Date.now() + offsetMs);
  return new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(now);
}
function getHourInZone(tz, offsetMs) {
  const now = new Date(Date.now() + offsetMs);
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "numeric", hour12: false }).formatToParts(now);
  return parseInt(parts.find(p => p.type === "hour")?.value || 0) + parseInt(parts.find(p => p.type === "minute")?.value || 0) / 60;
}
function getDayInZone(tz, offsetMs) {
  const now = new Date(Date.now() + offsetMs);
  return new Intl.DateTimeFormat("en-US", { timeZone: tz, weekday: "short", month: "short", day: "numeric" }).format(now);
}
function nowLocalTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
}
function nowLocalDate() {
  return new Date().toISOString().slice(0,10);
}

export default function App() {
  const [selected, setSelected] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.has("cities")) {
        const parsed = params.get("cities").split(",").map(s => {
          const [city, tz, country] = s.split("|");
          return city && tz ? { city, tz, country: country || "" } : null;
        }).filter(Boolean);
        if (parsed.length > 0) return parsed;
      }
      const saved = localStorage.getItem("worldtime-cities-v3");
      return saved ? JSON.parse(saved) : DEFAULT_CITIES;
    } catch { return DEFAULT_CITIES; }
  });
  const [offset, setOffset] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      return params.has("offset") ? parseInt(params.get("offset")) || 0 : 0;
    } catch { return 0; }
  });
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTime, setPickerTime] = useState(nowLocalTime());
  const [pickerDate, setPickerDate] = useState(nowLocalDate());
  const [pickerZone, setPickerZone] = useState("America/New_York");
  const [tick, setTick] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem("worldtime-theme") === "dark"; }
    catch { return false; }
  });
  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const dragRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 10000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  useEffect(() => {
    if (showSearch && searchRef.current) searchRef.current.focus();
  }, [showSearch]);
  useEffect(() => {
    localStorage.setItem("worldtime-cities-v3", JSON.stringify(selected));
  }, [selected]);
  useEffect(() => {
    localStorage.setItem("worldtime-theme", darkMode ? "dark" : "light");
  }, [darkMode]);
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      params.set("cities", selected.map(z => `${z.city}|${z.tz}|${z.country}`).join(","));
      if (offset !== 0) params.set("offset", offset);
      window.history.replaceState(null, "", `?${params}`);
    }, 300);
    return () => clearTimeout(timer);
  }, [selected, offset]);

  const applyPreciseTime = () => {
    if (!pickerZone) return;
    const [hour, minute] = pickerTime.split(":").map(Number);
    const nowParts = new Intl.DateTimeFormat("en-US", {
      timeZone: pickerZone, year:"numeric", month:"2-digit", day:"2-digit",
      hour:"2-digit", minute:"2-digit", hour12: false
    }).formatToParts(new Date());
    const p = {};
    nowParts.forEach(x => { p[x.type] = x.value; });
    const safeHour = p.hour === "24" ? "00" : p.hour;
    const zoneNow = new Date(`${p.year}-${p.month}-${p.day}T${safeHour}:${p.minute}:00`);
    const target = new Date(`${pickerDate}T${String(hour).padStart(2,"0")}:${String(minute).padStart(2,"0")}:00`);
    setOffset(Math.round((target - zoneNow) / 60000));
    setShowPicker(false);
  };

  const resetAll = () => { setOffset(0); setPickerTime(nowLocalTime()); setPickerDate(nowLocalDate()); };

  const reorder = (fromCity, toCity) => {
    setSelected(s => {
      const arr = [...s];
      const fi = arr.findIndex(z => z.city === fromCity);
      const ti = arr.findIndex(z => z.city === toCity);
      if (fi === -1 || ti === -1) return s;
      const [item] = arr.splice(fi, 1);
      arr.splice(ti, 0, item);
      return arr;
    });
  };

  const zones = selected;

  const results = TIMEZONES.filter(z =>
    z.city.toLowerCase().includes(search.toLowerCase()) && !selected.some(s => s.city === z.city)
  );

  const offsetMs = offset * 60000;
  const sliderLabel = offset === 0 ? "Live" : (() => {
    const a = Math.abs(offset), h = Math.floor(a / 60), m = a % 60;
    return `${offset > 0 ? "+" : "−"}${h > 0 ? h + "h" : ""}${m > 0 ? " " + m + "m" : ""}`.trim();
  })();

  const T = darkMode ? {
    bg:          "#111",
    surface:     "rgba(255,255,255,0.06)",
    border:      "rgba(255,255,255,0.08)",
    inputBg:     "rgba(255,255,255,0.07)",
    inputBorder: "rgba(255,255,255,0.15)",
    text:        "#ffffff",
    textMuted:   "#777",
    legendText:  "#555",
    panelBg:     "rgba(255,255,255,0.04)",
    colorScheme: "dark",
    optionBg:    "#1a1a1a",
    emptyText:   "#2a2a2a",
    workDot:     "rgba(255,255,255,0.7)",
    offDot:      "rgba(255,255,255,0.15)",
  } : {
    bg:          "#ffffff",
    surface:     "rgba(0,0,0,0.05)",
    border:      "rgba(0,0,0,0.1)",
    inputBg:     "rgba(0,0,0,0.05)",
    inputBorder: "rgba(0,0,0,0.15)",
    text:        "#111111",
    textMuted:   "#666",
    legendText:  "#222",
    panelBg:     "rgba(0,0,0,0.04)",
    colorScheme: "light",
    optionBg:    "#f5f5f5",
    emptyText:   "#cccccc",
    workDot:     "#ffffff",
    offDot:      "#222222",
  };

  const inputStyle = {
    background: T.inputBg, border: `1px solid ${T.inputBorder}`,
    borderRadius: 8, padding: "8px 12px", color: T.text, fontSize: 13, outline: "none", colorScheme: T.colorScheme
  };

  const LEGEND = [
    { bg: [C.purple, "#2d0f2e"], label: "Night" },
    { bg: [C.red,    "#8B0010"], label: "Early morning" },
    { bg: [C.yellow, "#fde96a"], label: "Morning" },
    { bg: [C.green,  "#5acc58"], label: "Early afternoon" },
    { bg: [C.blue,   "#0a5a7a"], label: "Afternoon" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Montserrat', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ padding: isMobile ? "12px 14px" : "16px 22px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: isMobile ? 10 : 0, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: C.red, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8.5" stroke="white" strokeWidth="1.5"/>
              <ellipse cx="10" cy="10" rx="4" ry="8.5" stroke="white" strokeWidth="1.5"/>
              <line x1="1.5" y1="7" x2="18.5" y2="7" stroke="white" strokeWidth="1.5"/>
              <line x1="1.5" y1="13" x2="18.5" y2="13" stroke="white" strokeWidth="1.5"/>
            </svg>
          </div>
          <div style={{ color: T.text, fontWeight: 800, fontSize: 15, letterSpacing: "-0.01em" }}>WE ARE VERY ON TIME</div>
        </div>
        <div style={{ display: "flex", gap: 8, flex: isMobile ? "1 0 100%" : "0", justifyContent: isMobile ? "stretch" : "flex-end" }}>
          <button onClick={() => setDarkMode(d => !d)}
            style={{ background: T.surface, border: `1px solid ${T.border}`, color: T.text, borderRadius: 9, padding: "7px 12px", fontSize: 15, cursor: "pointer" }}>
            {darkMode ? "☀️" : "🌙"}
          </button>
          <button onClick={() => {
              const cities = selected.map(z => `${z.city}|${z.tz}|${z.country}`).join(",");
              const qs = new URLSearchParams({ cities });
              if (offset !== 0) qs.set("offset", String(offset));
              const url = `https://wearevery.com/on-time?${qs}`;
              const doCopy = () => {
                const el = document.createElement("textarea");
                el.value = url;
                el.style.cssText = "position:fixed;opacity:0;pointer-events:none";
                document.body.appendChild(el); el.focus(); el.select();
                try { document.execCommand("copy"); } catch {}
                document.body.removeChild(el);
                setCopied(true); setTimeout(() => setCopied(false), 2000);
              };
              if (navigator.clipboard?.writeText) {
                navigator.clipboard.writeText(url)
                  .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })
                  .catch(doCopy);
              } else { doCopy(); }
            }}
            style={{ flex: isMobile ? 1 : "none", background: copied ? "rgba(54,173,52,0.2)" : T.surface, border: `1px solid ${copied ? C.green : T.border}`, color: copied ? C.green : T.text, borderRadius: 9, padding: "7px 15px", fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>
            {copied ? "✓ Copied!" : "Share"}
          </button>
          <button onClick={() => { setShowPicker(s => !s); setShowSearch(false); }}
            style={{ flex: isMobile ? 1 : "none", background: showPicker ? "rgba(227,6,19,0.2)" : T.surface, border: `1px solid ${showPicker ? C.red : T.border}`, color: T.text, borderRadius: 9, padding: "7px 15px", fontSize: 13, cursor: "pointer" }}>
            {showPicker ? "✕ Close" : "🕐 Set time"}
          </button>
          <button onClick={() => { setShowSearch(s => !s); setShowPicker(false); }}
            style={{ flex: isMobile ? 1 : "none", background: showSearch ? "rgba(16,159,204,0.2)" : T.surface, border: `1px solid ${showSearch ? C.blue : T.border}`, color: T.text, borderRadius: 9, padding: "7px 15px", fontSize: 13, cursor: "pointer" }}>
            {showSearch ? "✕ Cancel" : "+ City"}
          </button>
        </div>
      </div>

      {/* Precise Time Picker */}
      {showPicker && (
        <div style={{ padding: isMobile ? "14px 14px 16px" : "18px 22px 20px", borderBottom: `1px solid ${T.border}`, background: T.panelBg }}>
          <div style={{ color: C.red, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
            Set a specific time
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ color: T.textMuted, fontSize: 11 }}>City / timezone</label>
              <select value={pickerZone} onChange={e => setPickerZone(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {TIMEZONES.map(z => <option key={`${z.city}-${z.tz}`} value={z.tz} style={{ background: T.optionBg }}>{z.city}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ color: T.textMuted, fontSize: 11 }}>Time</label>
              <input type="time" value={pickerTime} onChange={e => setPickerTime(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ color: T.textMuted, fontSize: 11 }}>Date</label>
              <input type="date" value={pickerDate} onChange={e => setPickerDate(e.target.value)} style={inputStyle} />
            </div>
            <button onClick={applyPreciseTime}
              style={{ background: C.red, border: "none", color: "#fff", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Apply →
            </button>
          </div>
          <div style={{ color: T.textMuted, fontSize: 11, marginTop: 12 }}>
            Shows what time it is everywhere when it's {pickerTime} in {TIMEZONES.find(z => z.tz === pickerZone)?.city || pickerZone}
          </div>
        </div>
      )}

      {/* Search */}
      {showSearch && (
        <div style={{ padding: isMobile ? "10px 14px 12px" : "12px 22px 15px", borderBottom: `1px solid ${T.border}`, background: T.panelBg }}>
          <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search a city..."
            style={{ width: "100%", background: T.inputBg, border: `1px solid ${T.inputBorder}`, borderRadius: 9, padding: "9px 14px", color: T.text, fontSize: 14, outline: "none", boxSizing: "border-box", colorScheme: T.colorScheme }} />
          {search && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
              {results.length > 0
                ? results.slice(0, 8).map(z => (
                  <button key={`${z.city}-${z.tz}`} onClick={() => { setSelected(s => [...s, { city: z.city, tz: z.tz, country: z.country }]); setSearch(""); setShowSearch(false); }}
                    style={{ background: "rgba(16,159,204,0.15)", border: `1px solid ${C.blue}55`, color: C.blue, borderRadius: 7, padding: "5px 13px", fontSize: 13, cursor: "pointer" }}>
                    {z.city}
                  </button>
                ))
                : <span style={{ color: T.textMuted, fontSize: 13 }}>No cities found</span>}
            </div>
          )}
        </div>
      )}

      {/* Slider */}
      <div style={{ padding: isMobile ? "10px 14px" : "13px 22px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ color: T.textMuted, fontSize: 12, whiteSpace: "nowrap" }}>Quick shift</span>
        <input type="range" min={-720} max={720} step={15} value={offset} onChange={e => setOffset(+e.target.value)}
          style={{ flex: 1, accentColor: C.red, cursor: "pointer" }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: offset === 0 ? T.textMuted : C.red, minWidth: 52, textAlign: "right" }}>{sliderLabel}</span>
        {offset !== 0 && (
          <button onClick={resetAll}
            style={{ background: "rgba(227,6,19,0.12)", border: `1px solid ${C.red}55`, color: C.red, borderRadius: 7, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>
            ↺ Now
          </button>
        )}
      </div>

      {/* Cards */}
      <div style={isMobile
        ? { display: "grid", gridTemplateColumns: "1fr 1fr", padding: "16px", gap: 12 }
        : { display: "flex", overflowX: "auto", padding: "24px 20px", gap: 14, flex: 1 }}>
        {zones.map(zone => {
          const h = getHourInZone(zone.tz, offsetMs);
          const { bg, text, light } = getBg(h);
          const work = h >= 9 && h < 18;
          const titleColor = light ? "#111" : "#fff";
          const isDragging = dragId === zone.city;
          const isDropTarget = dragOverId === zone.city && !isDragging;
          return (
            <div key={zone.city}
              data-cardid={zone.city}
              draggable={true}
              onDragStart={() => { dragRef.current = zone.city; setDragId(zone.city); setDragOverId(null); }}
              onDragOver={e => { e.preventDefault(); if (dragRef.current && zone.city !== dragRef.current) setDragOverId(zone.city); }}
              onDragLeave={() => { if (dragOverId === zone.city) setDragOverId(null); }}
              onDrop={e => { e.preventDefault(); if (dragRef.current && zone.city !== dragRef.current) reorder(dragRef.current, zone.city); setDragOverId(null); }}
              onDragEnd={() => { dragRef.current = null; setDragId(null); setDragOverId(null); }}
              onMouseEnter={e => { if (!isDragging && !isMobile) { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 18px 48px rgba(0,0,0,0.6)"; } }}
              onMouseLeave={e => { if (!isMobile) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.45)"; } }}
              style={{
                ...(isMobile
                  ? { borderRadius: 16, padding: "16px 14px 14px", height: 190 }
                  : { minWidth: 155, flex: "0 0 155px", borderRadius: 20, padding: "20px 16px 18px", height: 230 }),
                background: `linear-gradient(160deg, ${bg[0]} 0%, ${bg[1]} 100%)`,
                position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between",
                boxShadow: isDropTarget ? "0 0 0 3px #fff, 0 8px 32px rgba(0,0,0,0.45)" : "0 8px 32px rgba(0,0,0,0.45)",
                transition: isDragging ? "opacity 0.15s" : "transform 0.18s, box-shadow 0.18s, opacity 0.15s",
                cursor: isDragging ? "grabbing" : "grab",
                opacity: isDragging ? 0.35 : 1,
                userSelect: "none",
              }}>
              <button onClick={() => setSelected(s => s.filter(x => x.city !== zone.city))}
                style={{ position: "absolute", top: 10, right: 10, background: light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.1)", border: "none", color: text, width: isMobile ? 20 : 22, height: isMobile ? 20 : 22, borderRadius: "50%", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.6 }}>
                ✕
              </button>
              <div>
                <div style={{ color: titleColor, fontSize: isMobile ? 12 : 13, fontWeight: 700 }}>{zone.city}</div>
                <div style={{ color: text, fontSize: 11, marginTop: 2, opacity: 0.7 }}>{zone.country}</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ color: titleColor, fontSize: isMobile ? 34 : 44, fontWeight: 800, letterSpacing: "-3px", lineHeight: 1, textShadow: light ? "none" : "0 2px 16px rgba(0,0,0,0.3)" }}>
                  {getTimeInZone(zone.tz, offsetMs)}
                </div>
                <div style={{ color: text, fontSize: 11, marginTop: 8, opacity: 0.7 }}>{getDayInZone(zone.tz, offsetMs)}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                  background: work ? "#FFFFFF" : "#000000",
                  boxShadow: work ? "0 0 6px rgba(255,255,255,0.7)" : "none" }} />
                <span style={{ color: work ? "#FFFFFF" : "#000000", fontSize: 11, opacity: 0.85 }}>{work ? "Work hours" : "Off hours"}</span>
              </div>
            </div>
          );
        })}
        {zones.length === 0 && (
          <div style={{ gridColumn: isMobile ? "1 / -1" : undefined, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: T.emptyText, fontSize: 14 }}>
            Add a city to begin ↑
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ padding: "0 22px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
        {LEGEND.map(({ bg, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: bg[0] }} />
            <span style={{ color: T.legendText, fontSize: 10 }}>{label}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.workDot, border: `1px solid ${T.border}` }} />
          <span style={{ color: T.legendText, fontSize: 10 }}>Work hours</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: T.offDot, border: `1px solid ${T.border}` }} />
          <span style={{ color: T.legendText, fontSize: 10 }}>Off hours</span>
        </div>
      </div>
    </div>
  );
}
