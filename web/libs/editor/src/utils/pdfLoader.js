/**
 * PDF.js loader utility.
 *
 * Provides a unified interface for loading PDF documents using PDF.js.
 * Handles worker configuration and document loading.
 */

// Import PDF.js
// Note: When using webpack, use the webpack entry point
let pdfjsLib = null;

/**
 * Initialize PDF.js library
 * @returns {Promise<Object>} PDF.js library object
 */
export async function initPdfJs() {
  if (pdfjsLib) {
    return pdfjsLib;
  }

  try {
    // Try webpack integration first
    pdfjsLib = await import('pdfjs-dist/webpack.mjs');
    console.log('PDF.js loaded via webpack integration');
  } catch (e) {
    // Fallback to standard import
    pdfjsLib = await import('pdfjs-dist');

    // Configure worker manually
    const workerSrc = await import('pdfjs-dist/build/pdf.worker.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    console.log('PDF.js loaded with manual worker configuration');
  }

  return pdfjsLib;
}

/**
 * Load a PDF document
 * @param {string|ArrayBuffer} source - URL or ArrayBuffer of PDF
 * @param {Object} options - Loading options
 * @returns {Promise<PDFDocumentProxy>} Loaded PDF document
 */
export async function loadPdf(source, options = {}) {
  const pdfjs = await initPdfJs();

  const loadingTask = pdfjs.getDocument({
    url: typeof source === 'string' ? source : undefined,
    data: typeof source !== 'string' ? source : undefined,
    ...options,
  });

  return loadingTask.promise;
}

/**
 * Render a PDF page to a canvas
 * @param {PDFPageProxy} page - PDF page object
 * @param {HTMLCanvasElement} canvas - Target canvas element
 * @param {Object} options - Rendering options
 * @returns {Promise<void>}
 */
export async function renderPage(page, canvas, options = {}) {
  const {
    scale = 1.0,
    rotation = 0,
    devicePixelRatio = window.devicePixelRatio || 1,
  } = options;

  // Get viewport with scale and rotation
  const viewport = page.getViewport({
    scale: scale,
    rotation: rotation,
  });

  // Set canvas dimensions for HiDPI
  const outputScale = devicePixelRatio;
  canvas.width = Math.floor(viewport.width * outputScale);
  canvas.height = Math.floor(viewport.height * outputScale);
  canvas.style.width = `${Math.floor(viewport.width)}px`;
  canvas.style.height = `${Math.floor(viewport.height)}px`;

  const context = canvas.getContext('2d');

  // HiDPI transform
  const transform = outputScale !== 1
    ? [outputScale, 0, 0, outputScale, 0, 0]
    : null;

  const renderContext = {
    canvasContext: context,
    transform: transform,
    viewport: viewport,
  };

  return page.render(renderContext).promise;
}

/**
 * Get text content from a PDF page
 * @param {PDFPageProxy} page - PDF page object
 * @returns {Promise<Object>} Text content with items and styles
 */
export async function getTextContent(page) {
  return page.getTextContent();
}

/**
 * Convert PDF text items to OCR-like token format with word-level granularity
 * @param {Object} textContent - PDF.js text content
 * @param {Object} viewport - Page viewport for coordinate conversion
 * @returns {Array} Array of token objects (one per word)
 */
export function textContentToTokens(textContent, viewport) {
  const tokens = [];
  const pageWidth = viewport.width;
  const pageHeight = viewport.height;
  let tokenIndex = 0;

  // DEBUG: Log what PDF.js returns
  console.log('=== PDF.js Text Content Debug ===');
  console.log('Total items:', textContent.items.length);
  console.log('First 10 items:', textContent.items.slice(0, 10).map(item => ({
    str: item.str,
    width: item.width,
    height: item.height,
    hasSpaces: item.str.includes(' '),
    charCount: item.str.length,
  })));

  textContent.items.forEach((item) => {
    if (!item.str.trim()) return; // Skip empty items

    // Transform matrix [a, b, c, d, e, f] where e,f are x,y positions
    const transform = item.transform;
    const itemX = transform[4];
    const itemY = transform[5];
    const itemWidth = item.width;
    const itemHeight = item.height;

    // Split text into words for fine-grained selection
    const text = item.str;
    const words = text.split(/(\s+)/); // Split but keep spaces for position calculation

    // Calculate character width (approximate - assumes monospace-like distribution)
    const totalChars = text.length;
    const charWidth = totalChars > 0 ? itemWidth / totalChars : 0;

    let charOffset = 0;

    words.forEach((word) => {
      const trimmedWord = word.trim();
      if (!trimmedWord) {
        // Skip whitespace but count its width for positioning
        charOffset += word.length;
        return;
      }

      // Calculate word position within the text item
      const wordX = itemX + (charOffset * charWidth);
      const wordWidth = word.length * charWidth;

      // Convert to normalized coordinates (0-1)
      // Note: PDF origin is bottom-left, canvas is top-left
      const normalizedX = wordX / pageWidth;
      const normalizedY = 1 - (itemY + itemHeight) / pageHeight; // Flip y-axis
      const normalizedWidth = wordWidth / pageWidth;
      const normalizedHeight = itemHeight / pageHeight;

      tokens.push({
        id: `pdf_t${tokenIndex}`,
        text: trimmedWord,
        bbox: [normalizedX, normalizedY, normalizedWidth, normalizedHeight],
        confidence: 1.0, // PDF text layer is always high confidence
      });

      tokenIndex++;
      charOffset += word.length;
    });
  });

  // DEBUG: Log generated tokens
  console.log('Generated tokens:', tokens.length);
  console.log('First 10 tokens:', tokens.slice(0, 10).map(t => ({
    text: t.text,
    bbox: t.bbox.map(n => n.toFixed(4)),
  })));
  console.log('=== End Debug ===');

  return tokens;
}

/**
 * PDF document wrapper class for easier management
 */
export class PdfDocument {
  constructor(source) {
    this.source = source;
    this.pdf = null;
    this.pages = new Map();
  }

  /**
   * Load the PDF document
   * @returns {Promise<PdfDocument>}
   */
  async load() {
    this.pdf = await loadPdf(this.source);
    return this;
  }

  /**
   * Get total number of pages
   * @returns {number}
   */
  get numPages() {
    return this.pdf ? this.pdf.numPages : 0;
  }

  /**
   * Get a specific page (cached)
   * @param {number} pageNum - 1-based page number
   * @returns {Promise<PDFPageProxy>}
   */
  async getPage(pageNum) {
    if (!this.pdf) {
      throw new Error('PDF not loaded');
    }

    if (!this.pages.has(pageNum)) {
      const page = await this.pdf.getPage(pageNum);
      this.pages.set(pageNum, page);
    }

    return this.pages.get(pageNum);
  }

  /**
   * Render a page to canvas
   * @param {number} pageNum - 1-based page number
   * @param {HTMLCanvasElement} canvas - Target canvas
   * @param {Object} options - Render options
   * @returns {Promise<void>}
   */
  async renderPage(pageNum, canvas, options = {}) {
    const page = await this.getPage(pageNum);
    return renderPage(page, canvas, options);
  }

  /**
   * Get text content from a page
   * @param {number} pageNum - 1-based page number
   * @returns {Promise<Object>}
   */
  async getTextContent(pageNum) {
    const page = await this.getPage(pageNum);
    return getTextContent(page);
  }

  /**
   * Get tokens from embedded text layer
   * @param {number} pageNum - 1-based page number
   * @param {number} scale - Scale for viewport
   * @returns {Promise<Array>}
   */
  async getTokens(pageNum, scale = 1.0) {
    console.log('[PdfDocument.getTokens] Called for page:', pageNum, 'scale:', scale);
    const page = await this.getPage(pageNum);
    console.log('[PdfDocument.getTokens] Got page:', pageNum);
    const viewport = page.getViewport({ scale });
    console.log('[PdfDocument.getTokens] Got viewport:', viewport.width, 'x', viewport.height);
    const textContent = await getTextContent(page);
    console.log('[PdfDocument.getTokens] Got textContent, items:', textContent.items.length);
    const tokens = textContentToTokens(textContent, viewport);
    console.log('[PdfDocument.getTokens] Generated tokens:', tokens.length);
    return tokens;
  }

  /**
   * Destroy the document and release resources
   */
  destroy() {
    if (this.pdf) {
      this.pdf.destroy();
      this.pdf = null;
      this.pages.clear();
    }
  }
}

export default {
  initPdfJs,
  loadPdf,
  renderPage,
  getTextContent,
  textContentToTokens,
  PdfDocument,
};
