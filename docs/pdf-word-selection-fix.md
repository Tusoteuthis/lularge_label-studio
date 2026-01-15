# PDF Word Selection Fix - Technical Documentation

**Date**: 2026-01-15
**Branch**: `005-multiline-pdf-annotation`
**Component**: `PdfOcr.jsx`, `pdfLoader.js`

## Problem Statement

Users could not select individual words within a PDF line. When attempting to select text, the entire line would be highlighted instead of allowing word-level granularity.

## Initial Symptoms

1. PDF rendering worked correctly
2. Bounding box selection (drawing rectangles) worked
3. Line-level text extraction worked
4. But word-level selection via the interactive token layer did not work
5. Console showed numerous MobX-State-Tree errors:
   ```
   Error: [mobx-state-tree] You are trying to read or write to an object
   that is no longer part of a state tree.
   (Object type: 'PdfOcrModel', Path upon death: '/annotationStore/annotations/0/root/children/0')
   ```

## Investigation Process

### Step 1: Initial Hypothesis - Tokenization Issue

We first suspected the tokenization logic wasn't splitting text into words correctly. Investigation of `pdfLoader.js` showed the `textContentToTokens()` function was correctly designed to split PDF text items into individual words.

### Step 2: Console Log Analysis

Added debug logging throughout the PDF loading chain:
- `[PdfOcr PDF load]` - PDF loading effect
- `[PdfDocument.getTokens]` - Token extraction
- `=== PDF.js Text Content Debug ===` - Tokenization output

**Key Finding**: The tokenization debug logs (`=== PDF.js Text Content Debug ===`) **never appeared** in the console, indicating the tokenization function was never being called.

### Step 3: Root Cause Identification

The MobX errors revealed the true problem: **component lifecycle issue**, not tokenization.

```
Timeline:
1. PdfOcr component mounts
2. useEffect starts async PDF load: loadDocument()
3. Component UNMOUNTS/REMOUNTS (annotation switching, React re-render)
4. Old model is detached from MST state tree
5. Async callback fires with old (dead) model reference
6. item.setPdfInfo() FAILS → component stays in loading state
7. pdfDoc never set → token loading useEffect never runs
8. Tokens never loaded → no word selection possible
```

The `item` reference captured in the async callback closure was **stale** - it pointed to a model that had been removed from the MobX-State-Tree when the component remounted.

### Step 4: Browser Caching Complications

During debugging, we encountered significant browser caching issues:
- Old JavaScript bundles were being served despite code changes
- Error line numbers in console didn't match updated source code
- Debug logs we added weren't appearing

**Resolution**:
- Cleared webpack cache (`rm -rf web/node_modules/.cache`)
- Killed NX daemon processes
- Forced webpack rebuild
- Used DevTools with "Disable cache" enabled
- Added unique identifiers to log messages (e.g., `[PdfOcr PDF load v2]`) to verify new code was running

## Solution Implemented

### File: `web/libs/editor/src/tags/object/PdfOcr/PdfOcr.jsx`

#### 1. Import `isAlive` from MobX-State-Tree

```javascript
import { isAlive } from 'mobx-state-tree';
```

#### 2. Guard PDF Loading useEffect

```javascript
useEffect(() => {
  if (!item._pdfUrl) return;

  let cancelled = false; // Cancellation flag for cleanup

  const loadDocument = async () => {
    // Check if item is still alive before any operations
    if (!isAlive(item)) {
      console.log('[PdfOcr PDF load] Item no longer alive, aborting');
      return;
    }

    item.setLoading(true);
    try {
      const doc = new PdfDocument(item._pdfUrl);
      await doc.load();

      // Guard: Check if component was unmounted or model detached
      if (cancelled || !isAlive(item)) {
        console.log('[PdfOcr PDF load] Cancelled or item dead after load, cleaning up');
        doc.destroy(); // Clean up resources
        return;
      }

      item.setPdfInfo(doc.numPages, 612, 792);
      item.setPdfDocument(doc);
      setPdfDoc(doc);
    } catch (error) {
      if (!cancelled && isAlive(item)) {
        console.error('Error loading PDF:', error);
        item.setError(`Failed to load PDF: ${error.message}`);
      }
    }
  };

  loadDocument();

  return () => {
    cancelled = true; // Set cancellation flag on unmount
    if (pdfDoc) {
      pdfDoc.destroy();
    }
  };
}, [item._pdfUrl]);
```

#### 3. Guard Token Loading useEffect

```javascript
useEffect(() => {
  if (!pdfDoc || !item.tokenoverlay) return;

  let cancelled = false;

  const loadTokens = async () => {
    try {
      const pageTokens = await pdfDoc.getTokens(item._currentPage);

      // Guard against stale callback
      if (cancelled || !isAlive(item)) {
        console.log('[PdfOcr loadTokens] Cancelled or item dead, skipping');
        return;
      }

      setTokens(pageTokens);
      item.setOcrAvailable(pageTokens.length > 0);

      if (pageTokens && pageTokens.length > 0) {
        item.setPageTokens(item._currentPage, pageTokens);
      }
    } catch (error) {
      if (!cancelled && isAlive(item)) {
        console.error('Error loading tokens:', error);
        setTokens([]);
      }
    }
  };

  loadTokens();

  return () => { cancelled = true; };
}, [pdfDoc, item._currentPage, item.tokenoverlay]);
```

## Key Learnings

### 1. MobX-State-Tree Lifecycle Awareness

When working with MST models in React components:
- Models can be detached from the state tree at any time
- Async callbacks may fire after the model is dead
- Always check `isAlive(model)` before performing operations on MST models in async code

### 2. Cancellation Pattern for Async Effects

React's useEffect cleanup function runs on unmount, but async operations continue. Use a cancellation flag pattern:

```javascript
useEffect(() => {
  let cancelled = false;

  async function doWork() {
    const result = await someAsyncOperation();
    if (cancelled) return; // Check before using result
    // ... use result
  }

  doWork();
  return () => { cancelled = true; };
}, [deps]);
```

### 3. Debugging Cache Issues

When debugging frontend issues:
- Browser caching can serve stale bundles even after code changes
- Use unique identifiers in log messages to verify which code version is running
- Enable "Disable cache" in DevTools during development
- Clear webpack cache when making significant changes

### 4. Follow the Error Trail

MobX-State-Tree errors are highly informative:
- They show the exact object type, path, and action that failed
- "Path upon death" indicates when/where the model was detached
- These errors often indicate lifecycle issues, not logic bugs

## Results Achieved

1. **Word-level text selection now works** - Users can select individual words within PDF lines
2. **MobX errors eliminated** for PDF loading - The `isAlive` guards prevent operations on dead models
3. **Proper resource cleanup** - PDF documents are destroyed when callbacks are cancelled
4. **Improved debugging** - Added comprehensive logging throughout the PDF loading chain

## Verification

After the fix, console logs show successful operation:

```
[PdfOcr PDF load v2] Effect triggered, pdfUrl: exists
[PdfOcr PDF load] Starting load for: /data/upload/7/document.pdf
[PdfOcr PDF load] Created PdfDocument, calling load()
[PdfOcr PDF load] Cancelled or item dead after load, cleaning up  ← Guard caught stale callback
[PdfOcr PDF load] PDF loaded, pages: 56  ← Second (valid) instance succeeded
[PdfOcr loadTokens] Got 499 tokens  ← Tokens loaded at word level
=== PDF.js Text Content Debug ===
Generated tokens: 499  ← Word-level tokenization working
```

## Related Files

- `web/libs/editor/src/tags/object/PdfOcr/PdfOcr.jsx` - Main component with guards
- `web/libs/editor/src/tags/object/PdfOcr/PdfOcrModel.js` - MST model definition
- `web/libs/editor/src/utils/pdfLoader.js` - PDF.js integration and tokenization

## Future Considerations

1. Similar `isAlive` guards may be needed in other components that use MST models with async operations
2. The remaining MobX errors related to `PdfRegionModel.setHighlight()` in the outliner tree are a separate issue that should be addressed
3. Consider creating a utility hook (e.g., `useSafeMstCallback`) to standardize this pattern across the codebase
