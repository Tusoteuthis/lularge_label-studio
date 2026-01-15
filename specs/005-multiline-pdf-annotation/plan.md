# Implementation Plan: Multi-Line PDF Text Annotation

**Branch**: `005-multiline-pdf-annotation` | **Date**: 2026-01-15 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-multiline-pdf-annotation/spec.md`

## Summary

Enable users to select and label text spanning multiple lines in PDFs with a single annotation. After thorough codebase exploration, **the core multi-line selection functionality already exists** in the frontend. The implementation focuses on verification, UX improvements, and ensuring export compatibility.

### Key Finding

**The frontend already has comprehensive multi-line text selection support:**

1. **Token-based selection** (`PdfOcr.jsx:660-738`): Click and drag across tokens with `handleTokenMouseDown`, `handleTokenMouseEnter`, creating selections that span multiple lines
2. **Multi-line highlight model** (`PdfTextHighlight.jsx:50-51`): Stores `tokenStart`/`tokenEnd` indices that naturally span lines
3. **Line tracking** (`PositionTracker.js:141-180`): Calculates `line`/`lineEnd` for multi-line selections
4. **Individual token rendering** (`PdfTextHighlight.jsx:427`): Renders non-rectangular highlights by drawing each token separately
5. **Export support** (`annotation_builder.py:255-292`): `pdflabels` type already handles multi-line via `calculate_multi_bboxes()`

## Technical Context

**Language/Version**: JavaScript/React (Frontend), Python 3.10+ (Backend)
**Primary Dependencies**: MobX-State-Tree, PDF.js, pdfplumber
**Storage**: N/A (annotations stored via existing Label Studio annotation system)
**Testing**: Jest (frontend), pytest (backend)
**Target Platform**: Web application
**Project Type**: Web (existing Label Studio fork)
**Performance Goals**: Selection under 5 seconds for 3+ line spans
**Constraints**: Must maintain backward compatibility with single-line annotations
**Scale/Scope**: Documents up to 100 pages with hundreds of annotations

## Constitution Check

*GATE: Passed - Feature extends existing functionality without architectural changes*

| Gate | Status | Notes |
|------|--------|-------|
| Complexity | PASS | Uses existing token selection architecture |
| Dependencies | PASS | No new dependencies required |
| Patterns | PASS | Follows existing MST model patterns |
| Testing | PASS | Can use existing test infrastructure |

## Project Structure

### Documentation (this feature)

```text
specs/005-multiline-pdf-annotation/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Architecture findings
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

```text
# Frontend (Primary - Verification/Enhancement)
web/libs/editor/src/
├── tags/object/PdfOcr/
│   ├── PdfOcr.jsx                    # Main PDF controller with selection handlers
│   └── components/
│       └── PositionTracker.js        # Line grouping and position calculation
└── regions/PdfRegion/
    └── PdfTextHighlight.jsx          # Text highlight model and rendering

# Backend (Export - Verification)
label_studio/data_export/pdf_export/
├── annotation_builder.py             # Annotation conversion with multi-bbox
└── canonical_text.py                 # Character range utilities
```

**Structure Decision**: Existing Label Studio architecture with PDF labeling extensions. No new directories needed.

## Complexity Tracking

No constitution violations. Feature uses existing patterns.

## Implementation Phases

### Phase 1: Verification (No Code Changes)

**Goal**: Confirm multi-line selection works end-to-end

| Task | File | Action |
|------|------|--------|
| V1 | UI | Open PDF labeling interface |
| V2 | UI | Click first token, drag to last token across 3+ lines |
| V3 | UI | Confirm all intermediate tokens are highlighted |
| V4 | UI | Apply label and verify single annotation created |
| V5 | Export | Export using PDF-ML export |
| V6 | Export | Verify output includes multiple bboxes (one per line) |

### Phase 2: UX Improvements (If Needed)

Based on verification results, potential enhancements:

| Enhancement | File | Description |
|-------------|------|-------------|
| Real-time feedback | `PdfOcr.jsx` | Ensure all tokens between start/end highlight during drag |
| Text preview | `PdfTextHighlight.jsx` | Show extracted text preview before labeling |
| Hover highlight | `PdfTextHighlight.jsx` | Highlight all tokens of multi-line annotation on hover |

### Phase 3: Export Compatibility (If Issues Found)

| Task | File | Description |
|------|------|-------------|
| Multi-bbox export | `annotation_builder.py:290-292` | Verify `calculate_multi_bboxes()` returns bbox per line |
| Token preservation | `annotation_builder.py` | Ensure tokenStart/tokenEnd preserved in export |

## Data Model

### Frontend Model (PdfTextHighlight - Existing)

```javascript
// MobX-State-Tree model in PdfTextHighlight.jsx
{
  type: "pdftexthighlight",
  tokenStart: 5,           // Start token index
  tokenEnd: 25,            // End token index (may span lines)
  text: "This is a long headline that spans multiple lines",
  page: 1,
  position: {
    page: 1,
    line: 3,               // Start line
    lineEnd: 5,            // End line (different = multi-line)
    tokenStart: 5,
    tokenEnd: 25,
    startOffset: 45,
    endOffset: 98
  }
}
```

### Export Format (ML Export - Existing)

```json
{
  "annotation_id": "123",
  "label": "Headline",
  "evidence": {
    "bboxes": [
      {"x": 100, "y": 200, "width": 500, "height": 20},
      {"x": 100, "y": 225, "width": 450, "height": 20},
      {"x": 100, "y": 250, "width": 300, "height": 20}
    ],
    "word_ids": ["tok_005", "tok_006", "...", "tok_025"],
    "quote": "This is a long headline that spans multiple lines",
    "char_start": 45,
    "char_end": 98
  }
}
```

## Test Plan

### Manual Testing

| Test | Steps | Expected Result |
|------|-------|-----------------|
| Multi-line selection | Click token on line 1, drag to token on line 3 | All tokens between start/end highlighted |
| Single annotation | Apply label after multi-line selection | One annotation in results panel |
| Complete text | Check annotation text content | All text from all lines included |
| Export verification | Export project with multi-line annotations | JSONL contains correct structure |

### Edge Cases

| Case | Test | Expected |
|------|------|----------|
| Single line | Select within one line | Works as before |
| Partial word start | Start selection mid-word | Includes partial word |
| Partial word end | End selection mid-word | Includes partial word |
| Very long selection | Select 10+ lines | All tokens captured |

## Success Criteria Mapping

| Criterion | Verification Method |
|-----------|---------------------|
| SC-001: Multi-line in <5 seconds | Manual timing test |
| SC-002: 100% text captured | Compare selection to annotation text |
| SC-003: Export correct | Inspect JSONL output structure |
| SC-004: Visual feedback | Observe highlighting during selection |
| SC-005: No error increase | Compare annotation quality |

## Files to Review/Modify

### Frontend (Primary)

| File | Purpose | Action |
|------|---------|--------|
| `web/libs/editor/src/tags/object/PdfOcr/PdfOcr.jsx` | Main PDF controller | Verify/enhance selection UX |
| `web/libs/editor/src/regions/PdfRegion/PdfTextHighlight.jsx` | Text highlight model | Verify multi-line rendering |
| `web/libs/editor/src/tags/object/PdfOcr/components/PositionTracker.js` | Line calculation | Verify line/lineEnd |

### Backend (Export)

| File | Purpose | Action |
|------|---------|--------|
| `label_studio/data_export/pdf_export/annotation_builder.py` | Annotation conversion | Verify multi-bbox export |

## Notes

- This is largely a **verification and documentation** task since the functionality exists
- If issues are found during verification, specific code changes will be identified
- Feature 003 (PDF ML export) already supports multi-bbox annotation handling
- The existing architecture uses token indices, which naturally handle multi-line
- Cross-page selection is explicitly out of scope (per spec.md)
