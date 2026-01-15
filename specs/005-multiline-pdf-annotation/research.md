# Research: Multi-Line PDF Text Annotation Architecture

**Feature**: 005-multiline-pdf-annotation
**Date**: 2026-01-15
**Status**: Complete

## Executive Summary

Investigation of the Label Studio PDF labeling codebase reveals that **multi-line text annotation is already fully implemented**. The token-based selection system naturally supports selecting text across multiple lines, and the export pipeline handles multi-line annotations with per-line bounding boxes.

## Architecture Overview

### Text Selection Flow

```
User Click → Token Mouse Down → Token Mouse Enter (drag) → Selection End
     ↓              ↓                    ↓                      ↓
  PdfOcr.jsx    selectionStart      updateSelection      createTextHighlight
  line 660      tokenIndex set      range expanded       annotation created
```

### Key Components

| Component | File | Responsibility |
|-----------|------|----------------|
| PdfOcr Controller | `web/libs/editor/src/tags/object/PdfOcr/PdfOcr.jsx` | Selection event handling |
| PdfTextHighlight Model | `web/libs/editor/src/regions/PdfRegion/PdfTextHighlight.jsx` | Annotation data model |
| PositionTracker | `web/libs/editor/src/tags/object/PdfOcr/components/PositionTracker.js` | Line grouping utilities |
| Annotation Builder | `label_studio/data_export/pdf_export/annotation_builder.py` | Export transformation |

## Frontend Implementation Details

### Token-Based Selection (PdfOcr.jsx:660-738)

The selection system uses token indices rather than character positions:

```javascript
// Selection starts on mouse down
handleTokenMouseDown = (e, token, tokenIndex) => {
  this.selectionStart = tokenIndex;
  this.selectionEnd = tokenIndex;
};

// Selection expands on drag
handleTokenMouseEnter = (e, token, tokenIndex) => {
  if (this.isSelecting) {
    this.selectionEnd = tokenIndex;
    // All tokens between start and end are selected
  }
};

// Multi-line annotation created on mouse up
handleTextSelectionEnd = () => {
  const tokens = this.getSelectedTokens(this.selectionStart, this.selectionEnd);
  // tokens may span multiple lines - handled automatically
  this.createTextHighlight(tokens);
};
```

### Line Tracking (PositionTracker.js:141-180)

Tokens are grouped into lines based on y-coordinate proximity:

```javascript
// Groups tokens into lines using y-tolerance
const DEFAULT_LINE_TOLERANCE = 0.015;

function groupTokensIntoLines(tokens, tolerance) {
  // Tokens within tolerance of same y-coordinate are on same line
  // Returns { lineIndex: [token1, token2, ...], ... }
}

// Calculate line range for selection
function getPositionReference(tokenStart, tokenEnd, tokens) {
  const startLine = getLineForToken(tokenStart);
  const endLine = getLineForToken(tokenEnd);
  return {
    line: startLine,
    lineEnd: endLine,  // Different from line = multi-line selection
    tokenStart,
    tokenEnd
  };
}
```

### Multi-Line Rendering (PdfTextHighlight.jsx:427)

Individual token highlighting enables non-rectangular selections:

```javascript
// Instead of drawing one rectangle, draw each token separately
renderHighlight() {
  const tokens = this.getTokensInRange(this.tokenStart, this.tokenEnd);
  return tokens.map(token => (
    <HighlightBox key={token.id} bbox={token.bbox} />
  ));
}
```

## Backend Export Implementation

### Multi-BBox Calculation (annotation_builder.py:38-88)

The export pipeline groups selected words by line:

```python
def calculate_multi_bboxes(word_ids, words, lines):
    """Calculate bounding boxes for multi-line text selections.

    Returns one bbox per line fragment for accurate visual representation.
    """
    # Group words by line
    words_by_line = {}
    for word in selection_words:
        words_by_line.setdefault(word.line_id, []).append(word)

    # Calculate bbox for each line fragment
    bboxes = []
    for line_id, line_words in words_by_line.items():
        line_bbox = merge_bboxes([w.bbox for w in line_words])
        bboxes.append(line_bbox)

    # Sort by vertical position (top to bottom)
    bboxes.sort(key=lambda b: b.y)
    return bboxes
```

### PDF Labels Handling (annotation_builder.py:255-292)

The `pdflabels` result type is fully supported:

```python
elif result_type in ("rectanglelabels", "pdflabels"):
    # Convert percentage coords to pixels
    bbox = BBoxXYWH(
        x=int(x * page_width / 100),
        y=int(y * page_height / 100),
        width=int(width * page_width / 100),
        height=int(height * page_height / 100),
    )
    bboxes = [bbox]

    # For pdflabels, also try position offsets
    if result_type == "pdflabels" and not word_ids:
        position = value.get("position", {})
        start_offset = position.get("startOffset", 0)
        end_offset = position.get("endOffset", 0)
        if start_offset or end_offset:
            word_ids = find_word_ids_in_range(start_offset, end_offset, ...)
            if word_ids:
                bboxes = calculate_multi_bboxes(word_ids, ...)
```

## Data Flow

### Selection to Annotation

```
1. User clicks token 5, drags to token 25
2. PdfOcr tracks selectionStart=5, selectionEnd=25
3. On release, getSelectedTokens(5, 25) returns tokens 5-25
4. Tokens may be on lines 3, 4, 5 (multi-line)
5. createTextHighlight builds annotation with:
   - tokenStart: 5
   - tokenEnd: 25
   - text: concatenated text from all tokens
   - position.line: 3
   - position.lineEnd: 5
```

### Annotation to Export

```
1. Export triggered for project
2. annotation_builder processes each annotation
3. For pdflabels type:
   - Extract position offsets
   - Find word_ids in character range
   - calculate_multi_bboxes groups by line
   - Returns [bbox_line3, bbox_line4, bbox_line5]
4. AnnotationRecord created with bboxes array
5. JSONL output includes all bboxes
```

## Verification Checklist

| Capability | Implementation | Status |
|------------|----------------|--------|
| Click-drag across lines | PdfOcr.jsx token selection | IMPLEMENTED |
| Multi-line highlighting | PdfTextHighlight.jsx per-token render | IMPLEMENTED |
| Line tracking | PositionTracker.js line/lineEnd | IMPLEMENTED |
| Single annotation record | MST model with tokenStart/tokenEnd | IMPLEMENTED |
| Multi-bbox export | annotation_builder.py calculate_multi_bboxes | IMPLEMENTED |
| Text concatenation | getSelectedTokens text extraction | IMPLEMENTED |

## Recommendations

### Immediate Actions

1. **Manual Verification**: Test the existing functionality in the UI to confirm it works as expected
2. **Export Testing**: Create multi-line annotations and export to verify JSONL structure

### Potential Enhancements

If issues are found during verification:

| Enhancement | Priority | Effort |
|-------------|----------|--------|
| Improved drag feedback | P2 | Low |
| Selection preview | P3 | Medium |
| Keyboard shortcuts | P3 | Medium |

## Conclusion

The multi-line PDF text annotation feature is architecturally complete. The token-based selection model inherently supports multi-line selections since it operates on token indices rather than line-constrained coordinates. The export pipeline correctly handles multi-line annotations by calculating per-line bounding boxes.

The primary work for feature 005 is:
1. Verification that existing functionality meets spec requirements
2. Documentation of the architecture (this document)
3. UX improvements if verification reveals gaps
