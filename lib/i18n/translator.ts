import { idToEn } from './dictionaries';
export type AppLanguage = 'id' | 'en';

export const regexTranslations: Array<[RegExp, (match: RegExpMatchArray) => string]> = [
  [/^Sistem Donor Darurat Aktif$/i, () => "Emergency Donor System Active"],
  [/^Sinyal SOS Aktif \((.+) & Sekitarnya\)$/i, (m) => `Active SOS Signals (${translateToEnglish(m[1])} and Nearby)`],
  [/^Sinyal SOS Aktif \((.+)\)$/i, (m) => `Active SOS Signals (${translateToEnglish(m[1])})`],
  [/^Butuh (\d+) Kantong$/i, (m) => `Needs ${m[1]} Bags`],
  [/^(\d+) detik lalu$/i, (m) => `${m[1]} seconds ago`],
  [/^(\d+) mnt lalu$/i, (m) => `${m[1]} min ago`],
  [/^(\d+) menit lalu$/i, (m) => `${m[1]} minutes ago`],
  [/^(\d+) jam lalu$/i, (m) => `${m[1]} ${m[1] === "1" ? "hour" : "hours"} ago`],
  [/^(\d+) hari lalu$/i, (m) => `${m[1]} ${m[1] === "1" ? "day" : "days"} ago`],
  [/^(\d+) menit yang lalu$/i, (m) => `${m[1]} minutes ago`],
  [/^(\d+) jam yang lalu$/i, (m) => `${m[1]} ${m[1] === "1" ? "hour" : "hours"} ago`],
  [/^(\d+) hari yang lalu$/i, (m) => `${m[1]} ${m[1] === "1" ? "day" : "days"} ago`],
  [/^Baru saja$/i, () => "Just now"],
  [/^Stok (.+): (\d+) kantong \((.+)\)$/i, (m) => `Stock ${m[1]}: ${m[2]} bags (${translateToEnglish(m[3])})`],
  [/^Pendonor Siaga \((.+)\)$/i, (m) => `Ready Donor (${m[1]})`],
  [/^Titik Terpilih \((.+)\)$/i, (m) => `Selected Point (${m[1]})`],
  [/^(\d+) Kali$/i, (m) => `${m[1]} Times`],
  [/^(\d+) Tahun$/i, (m) => `${m[1]} Year`],
  [/^(\d+) Thn$/i, (m) => `${m[1]} Yrs`],
  [/^(\d+)x \((\d+) Bln\)$/i, (m) => `${m[1]}x (${m[2]} Mo)`],
  [/^Jarak (.+) • Butuh (\d+) kantong$/i, (m) => `Distance ${m[1]} - Needs ${m[2]} bags`],
  [/^Menampilkan (\d+) pemohon di sekitar Anda\.$/i, (m) => `Showing ${m[1]} requesters around you.`],
  [/^Aktif: (.+)$/i, (m) => `Active: ${m[1]}`],
  [/^Urgensi: (.+)$/i, (m) => `Urgency: ${translateToEnglish(m[1])}`],
  [/^(\d+) Poin$/i, (m) => `${m[1]} Points`],
  [/^(\d+)x Donor$/i, (m) => `${m[1]}x Donations`],
  [/^Anda baru bisa mendonorkan darah lagi dalam (\d+) hari ke depan \(Jeda minimal 90 hari setelah donor terakhir\)\.$/i, (m) => `You can donate blood again in ${m[1]} days (minimum interval is 90 days after the last donation).`],
  [/^Belum layak donor \(Harus menunggu (\d+) hari lagi\)$/i, (m) => `Not eligible to donate yet (Must wait ${m[1]} more days)`],
  [/^Rhesus Positif \(\+\)$/i, () => "Rhesus Positive (+)"],
  [/^Rhesus Negatif \(-\)$/i, () => "Rhesus Negative (-)"],
  [/^Rhesus Positif \(\+\)$/i, () => "Rhesus Positive (+)"],
  [/^Rhesus Negatif \(-\)$/i, () => "Rhesus Negative (-)"],
  [/^Rhesus (Positif|Negatif) \(([+-])\)$/i, (m) => `Rhesus ${m[1] === "Positif" ? "Positive" : "Negative"} (${m[2]})`],
  [/^Terakhir Diperbarui: (.+) · Berlaku untuk: (.+)$/i, (m) => `Last Updated: ${m[1]} - Applies to: ${m[2]}`],
];


const enToId = Object.fromEntries(Object.entries(idToEn).map(([id, en]) => [en, id]));

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function translateToEnglish(text: string) {
  const normalized = normalizeText(text);
  if (!normalized) return text;
  const restored = enToId[normalized] ?? normalized;
  if (idToEn[restored]) return idToEn[restored];
  for (const [pattern, replacer] of regexTranslations) {
    const match = restored.match(pattern);
    if (match) return replacer(match);
  }
  return replaceKnownFragments(restored, idToEn);
}

function translateToIndonesian(text: string) {
  const normalized = normalizeText(text);
  if (!normalized) return text;
  if (enToId[normalized]) return enToId[normalized];
  return replaceKnownFragments(normalized, enToId);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceKnownFragments(text: string, dictionary: Record<string, string>) {
  return Object.entries(dictionary)
    .sort(([a], [b]) => b.length - a.length)
    .reduce((current, [source, target]) => {
      const pattern = new RegExp(`(^|[^A-Za-z])(${escapeRegExp(source)})(?=$|[^A-Za-z])`, "g");
      return current.replace(pattern, (_, prefix) => `${prefix}${target}`);
    }, text);
}

export function translateValue(value: string, language: AppLanguage) {
  if (!value.trim()) return value;
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const translated = language === "en" ? translateToEnglish(value) : translateToIndonesian(value);
  return `${leading}${translated}${trailing}`;
}

export function applyLanguage(language: AppLanguage) {
  if (typeof document === "undefined") return;

  document.documentElement.lang = language;
  document.title = language === "en" ? "BloodConnect - Emergency Blood Donation" : "BloodConnect - Donor Darah Darurat";

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "TEXTAREA"].includes(parent.tagName)) {
        return NodeFilter.FILTER_REJECT;
      }
      if (!node.textContent || !node.textContent.trim()) {
        return NodeFilter.FILTER_REJECT;
      }
      // Skip translation if the element or any ancestor has data-no-translate="true"
      let curr: HTMLElement | null = parent;
      while (curr) {
        if (curr.getAttribute && curr.getAttribute("data-no-translate") === "true") {
          return NodeFilter.FILTER_REJECT;
        }
        curr = curr.parentElement;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes: Text[] = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode as Text);
  }

  textNodes.forEach((node) => {
    const next = translateValue(node.textContent ?? "", language);
    if (node.textContent !== next) node.textContent = next;
  });

  document.querySelectorAll<HTMLElement>("[placeholder], [title], [aria-label]").forEach((el) => {
    // Skip if the element or any ancestor has data-no-translate="true"
    let curr: HTMLElement | null = el;
    let shouldSkip = false;
    while (curr) {
      if (curr.getAttribute && curr.getAttribute("data-no-translate") === "true") {
        shouldSkip = true;
        break;
      }
      curr = curr.parentElement;
    }
    if (shouldSkip) return;

    ["placeholder", "title", "aria-label"].forEach((attr) => {
      const current = el.getAttribute(attr);
      if (!current) return;
      const next = translateValue(current, language);
      if (current !== next) el.setAttribute(attr, next);
    });
  });
}

