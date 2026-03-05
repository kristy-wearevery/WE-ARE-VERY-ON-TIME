import { useState, useEffect, useRef } from "react";

const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&display=swap";
document.head.appendChild(link);

const TIMEZONES = [
  // Americas
  { id: 1,   city: "New York",        tz: "America/New_York",        country: "US" },
  { id: 6,   city: "San Francisco",   tz: "America/Los_Angeles",     country: "US" },
  { id: 9,   city: "Chicago",         tz: "America/Chicago",         country: "US" },
  { id: 10,  city: "Toronto",         tz: "America/Toronto",         country: "CA" },
  { id: 18,  city: "Mexico City",     tz: "America/Mexico_City",     country: "MX" },
  { id: 13,  city: "São Paulo",       tz: "America/Sao_Paulo",       country: "BR" },
  { id: 21,  city: "Los Angeles",     tz: "America/Los_Angeles",     country: "US" },
  { id: 22,  city: "Denver",          tz: "America/Denver",          country: "US" },
  { id: 23,  city: "Seattle",         tz: "America/Los_Angeles",     country: "US" },
  { id: 24,  city: "Miami",           tz: "America/New_York",        country: "US" },
  { id: 25,  city: "Boston",          tz: "America/New_York",        country: "US" },
  { id: 26,  city: "Atlanta",         tz: "America/New_York",        country: "US" },
  { id: 27,  city: "Dallas",          tz: "America/Chicago",         country: "US" },
  { id: 28,  city: "Phoenix",         tz: "America/Phoenix",         country: "US" },
  { id: 29,  city: "Honolulu",        tz: "Pacific/Honolulu",        country: "US" },
  { id: 30,  city: "Anchorage",       tz: "America/Anchorage",       country: "US" },
  { id: 31,  city: "Vancouver",       tz: "America/Vancouver",       country: "CA" },
  { id: 32,  city: "Montreal",        tz: "America/Toronto",         country: "CA" },
  { id: 33,  city: "Buenos Aires",    tz: "America/Argentina/Buenos_Aires", country: "AR" },
  { id: 34,  city: "Santiago",        tz: "America/Santiago",        country: "CL" },
  { id: 35,  city: "Bogotá",          tz: "America/Bogota",          country: "CO" },
  { id: 36,  city: "Lima",            tz: "America/Lima",            country: "PE" },
  { id: 37,  city: "Caracas",         tz: "America/Caracas",         country: "VE" },
  { id: 38,  city: "Havana",          tz: "America/Havana",          country: "CU" },
  // Europe
  { id: 2,   city: "London",          tz: "Europe/London",           country: "GB" },
  { id: 7,   city: "Paris",           tz: "Europe/Paris",            country: "FR" },
  { id: 11,  city: "Berlin",          tz: "Europe/Berlin",           country: "DE" },
  { id: 15,  city: "Amsterdam",       tz: "Europe/Amsterdam",        country: "NL" },
  { id: 40,  city: "Madrid",          tz: "Europe/Madrid",           country: "ES" },
  { id: 41,  city: "Rome",            tz: "Europe/Rome",             country: "IT" },
  { id: 42,  city: "Zurich",          tz: "Europe/Zurich",           country: "CH" },
  { id: 43,  city: "Brussels",        tz: "Europe/Brussels",         country: "BE" },
  { id: 44,  city: "Stockholm",       tz: "Europe/Stockholm",        country: "SE" },
  { id: 45,  city: "Oslo",            tz: "Europe/Oslo",             country: "NO" },
  { id: 46,  city: "Copenhagen",      tz: "Europe/Copenhagen",       country: "DK" },
  { id: 47,  city: "Helsinki",        tz: "Europe/Helsinki",         country: "FI" },
  { id: 48,  city: "Warsaw",          tz: "Europe/Warsaw",           country: "PL" },
  { id: 49,  city: "Vienna",          tz: "Europe/Vienna",           country: "AT" },
  { id: 50,  city: "Prague",          tz: "Europe/Prague",           country: "CZ" },
  { id: 51,  city: "Budapest",        tz: "Europe/Budapest",         country: "HU" },
  { id: 52,  city: "Bucharest",       tz: "Europe/Bucharest",        country: "RO" },
  { id: 53,  city: "Athens",          tz: "Europe/Athens",           country: "GR" },
  { id: 54,  city: "Istanbul",        tz: "Europe/Istanbul",         country: "TR" },
  { id: 55,  city: "Kyiv",            tz: "Europe/Kyiv",             country: "UA" },
  { id: 56,  city: "Moscow",          tz: "Europe/Moscow",           country: "RU" },
  { id: 57,  city: "Lisbon",          tz: "Europe/Lisbon",           country: "PT" },
  { id: 58,  city: "Dublin",          tz: "Europe/Dublin",           country: "IE" },
  // Middle East & Africa
  { id: 5,   city: "Dubai",           tz: "Asia/Dubai",              country: "AE" },
  { id: 20,  city: "Nairobi",         tz: "Africa/Nairobi",          country: "KE" },
  { id: 16,  city: "Cape Town",       tz: "Africa/Johannesburg",     country: "ZA" },
  { id: 60,  city: "Cairo",           tz: "Africa/Cairo",            country: "EG" },
  { id: 61,  city: "Lagos",           tz: "Africa/Lagos",            country: "NG" },
  { id: 62,  city: "Casablanca",      tz: "Africa/Casablanca",       country: "MA" },
  { id: 63,  city: "Accra",           tz: "Africa/Accra",            country: "GH" },
  { id: 64,  city: "Addis Ababa",     tz: "Africa/Addis_Ababa",      country: "ET" },
  { id: 65,  city: "Riyadh",          tz: "Asia/Riyadh",             country: "SA" },
  { id: 66,  city: "Tel Aviv",        tz: "Asia/Jerusalem",          country: "IL" },
  { id: 67,  city: "Doha",            tz: "Asia/Qatar",              country: "QA" },
  { id: 68,  city: "Kuwait City",     tz: "Asia/Kuwait",             country: "KW" },
  { id: 69,  city: "Muscat",          tz: "Asia/Muscat",             country: "OM" },
  { id: 70,  city: "Beirut",          tz: "Asia/Beirut",             country: "LB" },
  { id: 71,  city: "Tehran",          tz: "Asia/Tehran",             country: "IR" },
  // Asia & Pacific
  { id: 3,   city: "Tokyo",           tz: "Asia/Tokyo",              country: "JP" },
  { id: 4,   city: "Sydney",          tz: "Australia/Sydney",        country: "AU" },
  { id: 8,   city: "Singapore",       tz: "Asia/Singapore",          country: "SG" },
  { id: 12,  city: "Mumbai",          tz: "Asia/Kolkata",            country: "IN" },
  { id: 14,  city: "Seoul",           tz: "Asia/Seoul",              country: "KR" },
  { id: 17,  city: "Bangkok",         tz: "Asia/Bangkok",            country: "TH" },
  { id: 19,  city: "Auckland",        tz: "Pacific/Auckland",        country: "NZ" },
  { id: 80,  city: "Beijing",         tz: "Asia/Shanghai",           country: "CN" },
  { id: 81,  city: "Shanghai",        tz: "Asia/Shanghai",           country: "CN" },
  { id: 82,  city: "Hong Kong",       tz: "Asia/Hong_Kong",          country: "HK" },
  { id: 83,  city: "Taipei",          tz: "Asia/Taipei",             country: "TW" },
  { id: 84,  city: "Kuala Lumpur",    tz: "Asia/Kuala_Lumpur",       country: "MY" },
  { id: 85,  city: "Jakarta",         tz: "Asia/Jakarta",            country: "ID" },
  { id: 86,  city: "Manila",          tz: "Asia/Manila",             country: "PH" },
  { id: 87,  city: "Ho Chi Minh",     tz: "Asia/Ho_Chi_Minh",        country: "VN" },
  { id: 88,  city: "Dhaka",           tz: "Asia/Dhaka",              country: "BD" },
  { id: 89,  city: "Karachi",         tz: "Asia/Karachi",            country: "PK" },
  { id: 90,  city: "Colombo",         tz: "Asia/Colombo",            country: "LK" },
  { id: 91,  city: "Kathmandu",       tz: "Asia/Kathmandu",          country: "NP" },
  { id: 92,  city: "Tashkent",        tz: "Asia/Tashkent",           country: "UZ" },
  { id: 93,  city: "Almaty",          tz: "Asia/Almaty",             country: "KZ" },
  { id: 94,  city: "Baku",            tz: "Asia/Baku",               country: "AZ" },
  { id: 95,  city: "Tbilisi",         tz: "Asia/Tbilisi",            country: "GE" },
  { id: 96,  city: "Yerevan",         tz: "Asia/Yerevan",            country: "AM" },
  { id: 97,  city: "Yangon",          tz: "Asia/Rangoon",            country: "MM" },
  { id: 98,  city: "Novosibirsk",     tz: "Asia/Novosibirsk",        country: "RU" },
  { id: 99,  city: "Vladivostok",     tz: "Asia/Vladivostok",        country: "RU" },
  { id: 100, city: "Melbourne",       tz: "Australia/Melbourne",     country: "AU" },
  { id: 101, city: "Perth",           tz: "Australia/Perth",         country: "AU" },
  { id: 102, city: "Brisbane",        tz: "Australia/Brisbane",      country: "AU" },
  { id: 103, city: "Adelaide",        tz: "Australia/Adelaide",      country: "AU" },
  { id: 104, city: "Fiji",            tz: "Pacific/Fiji",            country: "FJ" },
  { id: 105, city: "Suva",            tz: "Pacific/Fiji",            country: "FJ" },
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
      if (params.has("cities")) return params.get("cities").split(",").map(Number).filter(Boolean);
      const saved = localStorage.getItem("worldtime-cities");
      return saved ? JSON.parse(saved) : [1, 2, 3, 4, 6];
    } catch {
      return [1, 2, 3, 4, 6];
    }
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
  const [pickerZone, setPickerZone] = useState(1);
  const [tick, setTick] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  const [dragId, setDragId] = useState(null);
  const dragRef = useRef(null);
  const lastOverRef = useRef(null);
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
    localStorage.setItem("worldtime-cities", JSON.stringify(selected));
  }, [selected]);
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("cities", selected.join(","));
    if (offset !== 0) params.set("offset", offset);
    window.history.replaceState(null, "", `?${params}`);
  }, [selected, offset]);

  const applyPreciseTime = () => {
    const zone = TIMEZONES.find(z => z.id === pickerZone);
    if (!zone) return;
    const [hour, minute] = pickerTime.split(":").map(Number);
    const nowParts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone.tz, year:"numeric", month:"2-digit", day:"2-digit",
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

  const reorder = (fromId, toId) => {
    setSelected(s => {
      const arr = [...s];
      const fi = arr.indexOf(fromId), ti = arr.indexOf(toId);
      if (fi === -1 || ti === -1) return s;
      arr.splice(fi, 1);
      arr.splice(ti, 0, fromId);
      return arr;
    });
  };

  const zones = TIMEZONES.filter(z => selected.includes(z.id));
  const results = TIMEZONES.filter(z => z.city.toLowerCase().includes(search.toLowerCase()) && !selected.includes(z.id));
  const offsetMs = offset * 60000;
  const sliderLabel = offset === 0 ? "Live" : (() => {
    const a = Math.abs(offset), h = Math.floor(a / 60), m = a % 60;
    return `${offset > 0 ? "+" : "−"}${h > 0 ? h + "h" : ""}${m > 0 ? " " + m + "m" : ""}`.trim();
  })();

  const inputStyle = {
    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 8, padding: "8px 12px", color: "#fff", fontSize: 13, outline: "none", colorScheme: "dark"
  };

  const LEGEND = [
    { bg: [C.purple, "#2d0f2e"], label: "Night" },
    { bg: [C.red,    "#8B0010"], label: "Early morning" },
    { bg: [C.yellow, "#fde96a"], label: "Morning" },
    { bg: [C.green,  "#5acc58"], label: "Early afternoon" },
    { bg: [C.blue,   "#0a5a7a"], label: "Afternoon" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#111", fontFamily: "'Montserrat', system-ui, sans-serif", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ padding: isMobile ? "12px 14px" : "16px 22px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: isMobile ? 10 : 0, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: C.red, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="10" cy="10" r="8.5" stroke="white" strokeWidth="1.5"/>
              <ellipse cx="10" cy="10" rx="4" ry="8.5" stroke="white" strokeWidth="1.5"/>
              <line x1="1.5" y1="7" x2="18.5" y2="7" stroke="white" strokeWidth="1.5"/>
              <line x1="1.5" y1="13" x2="18.5" y2="13" stroke="white" strokeWidth="1.5"/>
            </svg>
          </div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: "-0.01em" }}>WE ARE VERY ON TIME</div>
        </div>
        <div style={{ display: "flex", gap: 8, flex: isMobile ? "1 0 100%" : "0", justifyContent: isMobile ? "stretch" : "flex-end" }}>
          <button onClick={() => { navigator.clipboard.writeText(window.location.href).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); }}
            style={{ flex: isMobile ? 1 : "none", background: copied ? "rgba(54,173,52,0.2)" : "rgba(255,255,255,0.06)", border: `1px solid ${copied ? C.green : "rgba(255,255,255,0.1)"}`, color: copied ? C.green : "#ccc", borderRadius: 9, padding: "7px 15px", fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}>
            {copied ? "✓ Copied!" : "Share"}
          </button>
          <button onClick={() => { setShowPicker(s => !s); setShowSearch(false); }}
            style={{ flex: isMobile ? 1 : "none", background: showPicker ? "rgba(227,6,19,0.2)" : "rgba(255,255,255,0.06)", border: `1px solid ${showPicker ? C.red : "rgba(255,255,255,0.1)"}`, color: "#ccc", borderRadius: 9, padding: "7px 15px", fontSize: 13, cursor: "pointer" }}>
            {showPicker ? "✕ Close" : "🕐 Set time"}
          </button>
          <button onClick={() => { setShowSearch(s => !s); setShowPicker(false); }}
            style={{ flex: isMobile ? 1 : "none", background: showSearch ? "rgba(16,159,204,0.2)" : "rgba(255,255,255,0.06)", border: `1px solid ${showSearch ? C.blue : "rgba(255,255,255,0.1)"}`, color: "#ccc", borderRadius: 9, padding: "7px 15px", fontSize: 13, cursor: "pointer" }}>
            {showSearch ? "✕ Cancel" : "+ City"}
          </button>
        </div>
      </div>

      {/* Precise Time Picker */}
      {showPicker && (
        <div style={{ padding: isMobile ? "14px 14px 16px" : "18px 22px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(227,6,19,0.05)" }}>
          <div style={{ color: C.red, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
            Set a specific time
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ color: "#555", fontSize: 11 }}>City / timezone</label>
              <select value={pickerZone} onChange={e => setPickerZone(Number(e.target.value))} style={{ ...inputStyle, cursor: "pointer" }}>
                {TIMEZONES.map(z => <option key={z.id} value={z.id} style={{ background: "#1a1a1a" }}>{z.city}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ color: "#555", fontSize: 11 }}>Time</label>
              <input type="time" value={pickerTime} onChange={e => setPickerTime(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ color: "#555", fontSize: 11 }}>Date</label>
              <input type="date" value={pickerDate} onChange={e => setPickerDate(e.target.value)} style={inputStyle} />
            </div>
            <button onClick={applyPreciseTime}
              style={{ background: C.red, border: "none", color: "#fff", borderRadius: 8, padding: "9px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Apply →
            </button>
          </div>
          <div style={{ color: "#333", fontSize: 11, marginTop: 12 }}>
            Shows what time it is everywhere when it's {pickerTime} in {TIMEZONES.find(z => z.id === pickerZone)?.city}
          </div>
        </div>
      )}

      {/* Search */}
      {showSearch && (
        <div style={{ padding: isMobile ? "10px 14px 12px" : "12px 22px 15px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(16,159,204,0.05)" }}>
          <input ref={searchRef} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search a city..."
            style={{ width: "100%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.11)", borderRadius: 9, padding: "9px 14px", color: "#fff", fontSize: 14, outline: "none", boxSizing: "border-box" }} />
          {search && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
              {results.length > 0
                ? results.slice(0, 8).map(z => (
                  <button key={z.id} onClick={() => { setSelected(s => [...s, z.id]); setSearch(""); setShowSearch(false); }}
                    style={{ background: "rgba(16,159,204,0.15)", border: `1px solid ${C.blue}55`, color: C.blue, borderRadius: 7, padding: "5px 13px", fontSize: 13, cursor: "pointer" }}>
                    {z.city}
                  </button>
                ))
                : <span style={{ color: "#444", fontSize: 13 }}>No cities found</span>}
            </div>
          )}
        </div>
      )}

      {/* Slider */}
      <div style={{ padding: isMobile ? "10px 14px" : "13px 22px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ color: "#333", fontSize: 12, whiteSpace: "nowrap" }}>Quick shift</span>
        <input type="range" min={-720} max={720} step={15} value={offset} onChange={e => setOffset(+e.target.value)}
          style={{ flex: 1, accentColor: C.red, cursor: "pointer" }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: offset === 0 ? "#333" : C.red, minWidth: 52, textAlign: "right" }}>{sliderLabel}</span>
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
          const isDragging = dragId === zone.id;
          return (
            <div key={zone.id}
              data-cardid={zone.id}
              draggable={true}
              onDragStart={() => { dragRef.current = zone.id; lastOverRef.current = null; setDragId(zone.id); }}
              onDragOver={e => {
                e.preventDefault();
                if (dragRef.current && zone.id !== dragRef.current && zone.id !== lastOverRef.current) {
                  lastOverRef.current = zone.id;
                  reorder(dragRef.current, zone.id);
                }
              }}
              onDragEnd={() => { dragRef.current = null; lastOverRef.current = null; setDragId(null); }}
              onMouseEnter={e => { if (!isDragging && !isMobile) { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 18px 48px rgba(0,0,0,0.6)"; } }}
              onMouseLeave={e => { if (!isMobile) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.45)"; } }}
              style={{
                ...(isMobile
                  ? { borderRadius: 16, padding: "16px 14px 14px", height: 190 }
                  : { minWidth: 155, flex: "0 0 155px", borderRadius: 20, padding: "20px 16px 18px", height: 230 }),
                background: `linear-gradient(160deg, ${bg[0]} 0%, ${bg[1]} 100%)`,
                position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between",
                boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
                transition: isDragging ? "opacity 0.15s" : "transform 0.18s, box-shadow 0.18s, opacity 0.15s",
                cursor: isDragging ? "grabbing" : "grab",
                opacity: isDragging ? 0.35 : 1,
                userSelect: "none",
              }}>
              <button onClick={() => setSelected(s => s.filter(x => x !== zone.id))}
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
          <div style={{ gridColumn: isMobile ? "1 / -1" : undefined, flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#2a2a2a", fontSize: 14 }}>
            Add a city to begin ↑
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ padding: "0 22px 16px", display: "flex", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
        {LEGEND.map(({ bg, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: `linear-gradient(135deg, ${bg[0]}, ${bg[1]})`, border: "1px solid rgba(255,255,255,0.08)" }} />
            <span style={{ color: "#333", fontSize: 10 }}>{label}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#FFFFFF", border: "1px solid rgba(255,255,255,0.4)" }} />
          <span style={{ color: "#333", fontSize: 10 }}>Work hours</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#000000", border: "1px solid rgba(255,255,255,0.2)" }} />
          <span style={{ color: "#333", fontSize: 10 }}>Off hours</span>
        </div>
      </div>
    </div>
  );
}
