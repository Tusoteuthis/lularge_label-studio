# Research: PDF Document Labelling Schema

**Date**: 2026-01-15
**Feature**: 006-labelling-schema

## Research Tasks Completed

### 1. Annotation Serialization Format

**Decision**: Document the existing serialization format from the codebase
**Rationale**: Schema must accurately reflect actual annotation output
**Source Files Analyzed**:
- `web/libs/editor/src/regions/PdfRegion/PdfRegion.jsx` (serialize method, lines 219-271)
- `web/libs/editor/src/regions/PdfRegion/PdfTextHighlight.jsx` (serialize method, lines 204-227)
- `web/libs/editor/src/regions/Result.js` (result structure, lines 354-404)

### 2. Coordinate System

**Decision**: Percentage-based (0-100)
**Rationale**: All coordinates in the codebase use percentage values representing normalized positions relative to page dimensions
**Evidence**:
- PdfRegion: x, y, width, height all use 0-100 percentage
- PdfTextHighlight: Converts from normalized (0-1) to percentage (0-100)
- Token bboxes are converted: `normalized * 100`

### 3. Page Numbering

**Decision**: 1-based
**Rationale**: Matches user-facing page numbers and existing implementation
**Evidence**: All `page` fields in serialization use 1-based indexing

### 4. Schema Format

**Decision**: YAML
**Rationale**:
- Human-readable yet machine-parseable
- Supports comments for inline documentation
- Industry standard for configuration schemas
- Diff-friendly for version control
- Can be validated programmatically
**Alternatives Considered**:
- JSON Schema: More formal but less readable, no comment support
- Pure Markdown: Not machine-parseable
- XML: Verbose, less commonly used for schemas

## Discovered Data Structures

### PdfRegion (Bounding Box Annotations)

```yaml
type: "pdfregion"
value:
  x: number           # 0-100 percentage
  y: number           # 0-100 percentage
  width: number       # 0-100 percentage
  height: number      # 0-100 percentage
  rotation: number    # degrees (default 0)
  page: number        # 1-based page number

  # Optional fields
  isTable: boolean    # true if table region
  row_lines: number[] # sorted percentages 0-100
  col_lines: number[] # sorted percentages 0-100
  cellTexts: object   # "row-col" -> text mapping
  cells: array        # structured cell data
  extractedText: string
  text: string        # max 1000 chars
  position: object    # position reference
```

### PdfTextHighlight (Text Selection Annotations)

```yaml
type: "pdftexthighlight"
value:
  text: string        # extracted text content
  page: number        # 1-based page number
  tokenStart: number  # start token index
  tokenEnd: number    # end token index
  x: number           # 0-100 percentage
  y: number           # 0-100 percentage
  width: number       # 0-100 percentage
  height: number      # 0-100 percentage
  position: object    # optional position reference
```

### Choices (Document-Level Classification)

```yaml
type: "choices"
value:
  choices: array      # string[] or nested string[][]
```

### Position Reference (Common Structure)

```yaml
position:
  page: number        # required, 1-based
  line: number        # optional, 1-based
  lineEnd: number     # optional, for multi-line
  paragraph: number   # optional
  startOffset: number # optional, character offset
  endOffset: number   # optional
  tokenStart: number  # optional, token index
  tokenEnd: number    # optional
```

### Cell Structure (for Tables)

```yaml
cell:
  row: number         # 0-based row index
  col: number         # 0-based column index
  text: string        # cell text content
  x: number           # 0-100 percentage
  y: number           # 0-100 percentage
  width: number       # 0-100 percentage
  height: number      # 0-100 percentage
```

## Common Result Wrapper

All annotation types are wrapped in a common result structure:

```yaml
result:
  id: string          # unique result ID
  from_name: string   # control tag name
  to_name: string     # object tag name
  type: string        # "pdfregion", "pdftexthighlight", "choices"
  value: object       # type-specific value object

  # Optional metadata
  meta: object
  score: number
  readonly: boolean
  origin: string
  parentID: string
  item_index: number
```

## No Outstanding Clarifications

All technical details have been resolved through codebase analysis. No NEEDS CLARIFICATION items remain.
