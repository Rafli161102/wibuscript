// File: src/modules/web.ts
// ============================================================================
// MODUL DOMAIN WEB WIBUSCRIPT (wibuscript/web)
// Wrapper fungsi tipis untuk fetch data HTTP dan manipulasi DOM dasar.
// Mendukung eksekusi di Browser (DOM asli) dan Node.js / CLI (Virtual DOM).
// Mematuhi kesetaraan Sistem 4 Dialek Mutlak WibuScript.
// ============================================================================

/**
 * Representasi Virtual DOM Element untuk lingkungan tanpa peramban (Node.js/CLI/SSR).
 */
export class VirtualDOMElement {
  public tagName: string;
  public textContent: string = "";
  public innerHTML: string = "";
  public attributes: Record<string, string> = {};
  public children: VirtualDOMElement[] = [];
  public parent: VirtualDOMElement | null = null;
  public eventListeners: Record<string, Function[]> = {};

  constructor(tagName: string, attributes: Record<string, string> = {}) {
    this.tagName = tagName.toUpperCase();
    this.attributes = { ...attributes };
  }

  public appendChild(child: VirtualDOMElement): VirtualDOMElement {
    child.parent = this;
    this.children.push(child);
    return child;
  }

  public addEventListener(event: string, handler: Function): void {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(handler);
  }

  public dispatchEvent(event: string, eventData: any = {}): void {
    const handlers = this.eventListeners[event] || [];
    for (const handler of handlers) {
      handler(eventData);
    }
  }

  public querySelector(selector: string): VirtualDOMElement | null {
    const isId = selector.startsWith("#");
    const isClass = selector.startsWith(".");
    const clean = selector.replace(/^[#.]/, "");

    for (const child of this.children) {
      if (isId && child.attributes["id"] === clean) return child;
      if (isClass && child.attributes["class"]?.split(/\s+/).includes(clean)) return child;
      if (!isId && !isClass && child.tagName.toLowerCase() === selector.toLowerCase()) return child;

      const found = child.querySelector(selector);
      if (found) return found;
    }
    return null;
  }
}

/**
 * Root Document Virtual untuk lingkungan Node.js.
 */
class VirtualDocument {
  public body: VirtualDOMElement;

  constructor() {
    this.body = new VirtualDOMElement("body");
  }

  public createElement(tagName: string, attributes?: Record<string, string>): VirtualDOMElement {
    return new VirtualDOMElement(tagName, attributes);
  }

  public querySelector(selector: string): VirtualDOMElement | null {
    if (selector.toLowerCase() === "body") return this.body;
    return this.body.querySelector(selector);
  }

  public reset(): void {
    this.body = new VirtualDOMElement("body");
  }
}

export const virtualDocument = new VirtualDocument();

/**
 * Wrapper tipis pengambilan data via HTTP/HTTPS (Fetch API).
 */
export async function fetchData(url: string, options: any = {}): Promise<any> {
  const fetchFn = typeof globalThis !== "undefined" && typeof globalThis.fetch === "function"
    ? globalThis.fetch
    : null;

  if (!fetchFn) {
    throw new Error("[Web Error] API fetch tidak tersedia pada runtime ini.");
  }

  const response = await fetchFn(url, options);
  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    text: async () => await response.text(),
    json: async () => await response.json(),
    url: response.url
  };
}

/**
 * Mencari elemen pada dokumen (DOM Browser atau Virtual DOM).
 */
export function selectElement(selector: string): any {
  if (typeof document !== "undefined" && typeof document.querySelector === "function") {
    return document.querySelector(selector);
  }
  return virtualDocument.querySelector(selector);
}

/**
 * Membuat elemen baru pada dokumen.
 */
export function createElement(tagName: string, attributes: Record<string, string> = {}): any {
  if (typeof document !== "undefined" && typeof document.createElement === "function") {
    const el = document.createElement(tagName);
    for (const [key, val] of Object.entries(attributes)) {
      el.setAttribute(key, val);
    }
    return el;
  }
  return virtualDocument.createElement(tagName, attributes);
}

/**
 * Menambahkan anak elemen ke induk elemen.
 */
export function appendElement(parent: any, child: any): any {
  if (parent && typeof parent.appendChild === "function") {
    return parent.appendChild(child);
  }
  throw new Error("[Web Error] Objek induk tidak memiliki fungsi appendChild.");
}

/**
 * Mengubah atau mengatur teks dari suatu elemen.
 */
export function setText(element: any, text: string): any {
  if (element) {
    element.textContent = String(text);
    return element;
  }
  throw new Error("[Web Error] Elemen tidak valid untuk setText.");
}

/**
 * Mengambil teks dari suatu elemen.
 */
export function getText(element: any): string {
  if (element) {
    return element.textContent ?? "";
  }
  return "";
}

/**
 * Mengubah atau mengatur HTML internal dari suatu elemen.
 */
export function setHtml(element: any, html: string): any {
  if (element) {
    element.innerHTML = String(html);
    return element;
  }
  throw new Error("[Web Error] Elemen tidak valid untuk setHtml.");
}

/**
 * Memasang pendengar peristiwa (event listener) pada elemen.
 */
export function onEvent(element: any, eventName: string, handler: Function): any {
  if (element && typeof element.addEventListener === "function") {
    element.addEventListener(eventName, handler);
    return element;
  }
  throw new Error("[Web Error] Elemen tidak mendukung addEventListener.");
}

// ============================================================================
// ALIAS KESETARAAN 4 DIALEK MUTLAK WIBUSCRIPT
// ============================================================================

// 1. Jepang Murni (Formal & Presisi)
export const tsunagari = fetchData;
export const youso = selectElement;
export const yousoTsukuru = createElement;
export const yousoTsukeru = appendElement;
export const mojiOkikae = setText;
export const mojiToru = getText;
export const htmlOkikae = setHtml;
export const dekigoto = onEvent;

// 2. Jepang Singkat (Minimalis Shorthand)
export const tsu = fetchData;
export const you = selectElement;
export const youTsu = createElement;
export const youTsuke = appendElement;
export const moOki = setText;
export const moTo = getText;
export const htOki = setHtml;
export const deki = onEvent;

// 3. Wibu Absurd (Slang Otaku)
export const tarikData = fetchData;
export const comotElemen = selectElement;
export const bikinElemen = createElement;
export const tempelElemen = appendElement;
export const gantiTeks = setText;
export const ambilTeks = getText;
export const gantiHtml = setHtml;
export const pasangEvent = onEvent;

// 4. Meme Rongawi (Kultur Ngawiverse)
export const sedotdata = fetchData;
export const cidukunsur = selectElement;
export const cetakunsur = createElement;
export const tempelunsur = appendElement;
export const salintulisan = setText;
export const bacatulisan = getText;
export const salinhtml = setHtml;
export const tunggukenak = onEvent;

// 5. Universal & Standar
export const fetch = fetchData;
export const pilihElemen = selectElement;
export const buatElemen = createElement;
export const tambahElemen = appendElement;
export const setTeks = setText;
export const pasangAksi = onEvent;

// Ekspor default objek modul
export default {
  // Kanonikal Universal
  fetchData,
  selectElement,
  createElement,
  appendElement,
  setText,
  getText,
  setHtml,
  onEvent,
  fetch,
  pilihElemen,
  buatElemen,
  tambahElemen,
  setTeks,
  pasangAksi,

  // Jepang Murni
  tsunagari,
  youso,
  yousoTsukuru,
  yousoTsukeru,
  mojiOkikae,
  mojiToru,
  htmlOkikae,
  dekigoto,

  // Jepang Singkat
  tsu,
  you,
  youTsu,
  youTsuke,
  moOki,
  moTo,
  htOki,
  deki,

  // Wibu Absurd
  tarikData,
  comotElemen,
  bikinElemen,
  tempelElemen,
  gantiTeks,
  ambilTeks,
  gantiHtml,
  pasangEvent,

  // Meme Rongawi
  sedotdata,
  cidukunsur,
  cetakunsur,
  tempelunsur,
  salintulisan,
  bacatulisan,
  salinhtml,
  tunggukenak,

  // Virtual DOM
  virtualDocument,
  VirtualDOMElement
};
