# Data Model: PDF Document Labelling Schema

**Date**: 2026-01-15
**Feature**: 006-labelling-schema

## Entity Definitions

### 1. AnnotationResult (Base)

Common wrapper for all annotation types.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier for this result |
| from_name | string | Yes | Name of the control tag that created this result |
| to_name | string | Yes | Name of the object tag being annotated |
| type | enum | Yes | Annotation type discriminator |
| value | object | Yes | Type-specific value (see below) |
| meta | object | No | Additional metadata |
| score | number | No | Confidence score (0-1) |
| readonly | boolean | No | If true, result cannot be edited |
| origin | string | No | Source of the annotation |
| parentID | string | No | ID of parent result (for nested) |

**Type Values**: `"choices"`, `"pdfregion"`, `"pdftexthighlight"`

---

### 2. DocumentLabel

Represents a classification applied to an entire document.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | literal | Yes | Always `"choices"` |
| value.choices | string[] | Yes | Array of selected label values |

**Validation Rules**:
- `choices` array must have at least one element
- Each choice must match a defined label value

**Example**:
```yaml
type: "choices"
value:
  choices: ["Invoice", "Financial"]
```

---

### 3. TextLabel

Represents labelled text within a document (word/phrase/paragraph selection).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | literal | Yes | Always `"pdftexthighlight"` |
| value.text | string | Yes | The selected text content |
| value.page | integer | Yes | Page number (1-based) |
| value.tokenStart | integer | Yes | Start token index in page |
| value.tokenEnd | integer | Yes | End token index in page |
| value.x | number | Yes | Bounding box X (0-100%) |
| value.y | number | Yes | Bounding box Y (0-100%) |
| value.width | number | Yes | Bounding box width (0-100%) |
| value.height | number | Yes | Bounding box height (0-100%) |
| value.position | Position | No | Detailed position reference |

**Validation Rules**:
- `page` must be >= 1
- `tokenStart` must be >= 0
- `tokenEnd` must be >= `tokenStart`
- All percentage values must be 0-100

**Example**:
```yaml
type: "pdftexthighlight"
value:
  text: "Invoice #12345"
  page: 1
  tokenStart: 5
  tokenEnd: 7
  x: 10.5
  y: 15.2
  width: 25.0
  height: 3.5
```

---

### 4. TableLabel

Represents a labelled table region with optional structure.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | literal | Yes | Always `"pdfregion"` |
| value.isTable | boolean | Yes | Always `true` for tables |
| value.x | number | Yes | Region X position (0-100%) |
| value.y | number | Yes | Region Y position (0-100%) |
| value.width | number | Yes | Region width (0-100%) |
| value.height | number | Yes | Region height (0-100%) |
| value.page | integer | Yes | Page number (1-based) |
| value.rotation | number | No | Rotation in degrees (default 0) |
| value.row_lines | number[] | No | Row gridline positions (0-100%) |
| value.col_lines | number[] | No | Column gridline positions (0-100%) |
| value.cellTexts | object | No | Map of "row-col" to text |
| value.cells | Cell[] | No | Structured cell data |
| value.extractedText | string | No | OCR-extracted text |

**Validation Rules**:
- `page` must be >= 1
- All percentage values must be 0-100
- `row_lines` and `col_lines` must be sorted ascending
- Cell indices must be within defined grid bounds

**Example**:
```yaml
type: "pdfregion"
value:
  isTable: true
  x: 5.0
  y: 30.0
  width: 90.0
  height: 40.0
  page: 2
  rotation: 0
  row_lines: [0, 33.3, 66.6, 100]
  col_lines: [0, 50, 100]
  cellTexts:
    "0-0": "Header 1"
    "0-1": "Header 2"
    "1-0": "Value 1"
    "1-1": "Value 2"
```

---

### 5. ImageLabel

Represents a labelled image region within a document.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | literal | Yes | Always `"pdfregion"` |
| value.x | number | Yes | Region X position (0-100%) |
| value.y | number | Yes | Region Y position (0-100%) |
| value.width | number | Yes | Region width (0-100%) |
| value.height | number | Yes | Region height (0-100%) |
| value.page | integer | Yes | Page number (1-based) |
| value.rotation | number | No | Rotation in degrees (default 0) |
| value.text | string | No | Description or classification |

**Validation Rules**:
- `page` must be >= 1
- All percentage values must be 0-100
- `text` max length 1000 characters

**Example**:
```yaml
type: "pdfregion"
value:
  x: 20.0
  y: 50.0
  width: 60.0
  height: 30.0
  page: 1
  text: "Company Logo"
```

---

### 6. Position (Embedded Object)

Detailed position reference for text selections.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| page | integer | Yes | Page number (1-based) |
| line | integer | No | Line number (1-based) |
| lineEnd | integer | No | End line for multi-line |
| paragraph | integer | No | Paragraph index |
| startOffset | integer | No | Character offset from line start |
| endOffset | integer | No | End character offset |
| tokenStart | integer | No | Token index in page |
| tokenEnd | integer | No | End token index |

---

### 7. Cell (Embedded Object)

Table cell data structure.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| row | integer | Yes | Row index (0-based) |
| col | integer | Yes | Column index (0-based) |
| text | string | Yes | Cell text content |
| x | number | Yes | Cell X position (0-100%) |
| y | number | Yes | Cell Y position (0-100%) |
| width | number | Yes | Cell width (0-100%) |
| height | number | Yes | Cell height (0-100%) |

## Entity Relationships

```
AnnotationResult
    ├── DocumentLabel (type="choices")
    │       └── value.choices[]
    │
    ├── TextLabel (type="pdftexthighlight")
    │       └── value.position? → Position
    │
    └── RegionLabel (type="pdfregion")
            ├── TableLabel (isTable=true)
            │       ├── value.cells[]? → Cell[]
            │       └── value.cellTexts{}
            │
            └── ImageLabel (isTable=false/undefined)
```

## State Transitions

This is a documentation schema - no state transitions apply. Annotations are created, optionally modified, and exported.
