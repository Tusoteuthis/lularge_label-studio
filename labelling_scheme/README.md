# PDF Document Labelling Schema

**Version**: 1.1.0
**Last Updated**: 2026-01-16

This directory contains the versioned schema documentation for PDF document annotation in Label Studio. The schema defines all annotation output formats for document classification, text selection, table regions, and image regions. Also includes XML configuration templates for Label Studio projects.

## Quick Reference

| Label Type | Result Type | Use Case | Key Fields |
|------------|-------------|----------|------------|
| **DocumentLabel** | `choices` | Whole-document classification | `value.choices[]` |
| **TextLabel** | `pdftexthighlight` | Word/phrase/paragraph selection | `text`, `page`, `tokenStart`, `tokenEnd`, bbox |
| **TableLabel** | `pdfregion` | Table with structure | `isTable=true`, `row_lines`, `col_lines`, `cellTexts` |
| **ImageLabel** | `pdfregion` | Image/visual element | bbox, `text` for description |

## Coordinate System

All spatial coordinates use **percentage-based values (0-100)**:

- **x**: Horizontal position from left edge (0 = left, 100 = right)
- **y**: Vertical position from top edge (0 = top, 100 = bottom)
- **width**: Horizontal span as percentage of page width
- **height**: Vertical span as percentage of page height

**Example**: A region at `x=10, y=20, width=30, height=15` occupies 10-40% horizontally and 20-35% vertically.

## Page Numbering

Page numbers are **1-based** (first page = 1), matching user-facing page display.

---

## Label Types

### 1. DocumentLabel (Document Classification)

Classifies the entire document with one or more labels.

**Result Type**: `choices`

**Use Cases**:
- Categorizing documents (Invoice, Contract, Report, Letter)
- Multi-label classification (Financial + Confidential)
- Document routing and filtering

**Example**:

```json
{
  "id": "result_doc_001",
  "from_name": "document_type",
  "to_name": "pdf",
  "type": "choices",
  "value": {
    "choices": ["Invoice", "Financial"]
  }
}
```

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `value.choices` | string[] | Yes | Array of selected classification values |

---

### 2. TextLabel (Text Selection)

Labels selected words, phrases, or multi-line text spans within the document.

**Result Type**: `pdftexthighlight`

**Use Cases**:
- Named entity recognition (dates, amounts, names)
- Key information extraction (invoice numbers, addresses)
- Text span annotation for NLP training

**Single Word Example**:

```json
{
  "id": "result_text_001",
  "from_name": "ner_labels",
  "to_name": "pdf",
  "type": "pdftexthighlight",
  "value": {
    "text": "Invoice",
    "page": 1,
    "tokenStart": 5,
    "tokenEnd": 5,
    "x": 10.5,
    "y": 15.2,
    "width": 12.0,
    "height": 2.5
  }
}
```

**Multi-Word Example**:

```json
{
  "id": "result_text_002",
  "from_name": "ner_labels",
  "to_name": "pdf",
  "type": "pdftexthighlight",
  "value": {
    "text": "Invoice #12345",
    "page": 1,
    "tokenStart": 5,
    "tokenEnd": 7,
    "x": 10.5,
    "y": 15.2,
    "width": 25.0,
    "height": 2.5,
    "position": {
      "page": 1,
      "line": 3,
      "tokenStart": 5,
      "tokenEnd": 7
    }
  }
}
```

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `value.text` | string | Yes | The selected text content |
| `value.page` | integer | Yes | Page number (1-based) |
| `value.tokenStart` | integer | Yes | Start token index in page |
| `value.tokenEnd` | integer | Yes | End token index in page |
| `value.x` | number | Yes | Bounding box X (0-100%) |
| `value.y` | number | Yes | Bounding box Y (0-100%) |
| `value.width` | number | Yes | Bounding box width (0-100%) |
| `value.height` | number | Yes | Bounding box height (0-100%) |
| `value.position` | object | No | Detailed position reference |

**Token Selection Notes**:
- `tokenStart` and `tokenEnd` refer to indices in the page's token array
- Tokens are extracted from PDF text layer using PDF.js
- For multi-line selections, the bounding box encompasses all selected tokens

---

### 3. TableLabel (Table Region)

Labels table regions with optional row/column structure and cell content extraction.

**Result Type**: `pdfregion` with `isTable: true`

**Use Cases**:
- Structured data extraction from tables
- Table detection and segmentation
- Cell-level content extraction

**Example with Gridlines**:

```json
{
  "id": "result_table_001",
  "from_name": "table_labels",
  "to_name": "pdf",
  "type": "pdfregion",
  "value": {
    "isTable": true,
    "x": 5.0,
    "y": 30.0,
    "width": 90.0,
    "height": 40.0,
    "page": 2,
    "rotation": 0,
    "row_lines": [0, 33.3, 66.6, 100],
    "col_lines": [0, 50, 100],
    "cellTexts": {
      "0-0": "Header 1",
      "0-1": "Header 2",
      "1-0": "Value A",
      "1-1": "Value B",
      "2-0": "Value C",
      "2-1": "Value D"
    }
  }
}
```

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `value.isTable` | boolean | Yes | Must be `true` for tables |
| `value.x` | number | Yes | Region X position (0-100%) |
| `value.y` | number | Yes | Region Y position (0-100%) |
| `value.width` | number | Yes | Region width (0-100%) |
| `value.height` | number | Yes | Region height (0-100%) |
| `value.page` | integer | Yes | Page number (1-based) |
| `value.rotation` | number | No | Rotation in degrees (default: 0) |
| `value.row_lines` | number[] | No | Row gridline positions (0-100%) |
| `value.col_lines` | number[] | No | Column gridline positions (0-100%) |
| `value.cellTexts` | object | No | Map of "row-col" to text content |
| `value.cells` | array | No | Structured cell data array |
| `value.extractedText` | string | No | OCR-extracted text |

**Gridline Notes**:
- `row_lines` and `col_lines` are percentages relative to the region bounds
- Values must be sorted in ascending order
- `[0, 33.3, 66.6, 100]` creates 3 equal rows
- `[0, 50, 100]` creates 2 equal columns

**Cell Mapping**:
- `cellTexts` uses `"row-col"` format keys (0-indexed)
- `"0-0"` = first row, first column
- `"1-2"` = second row, third column

---

### 4. ImageLabel (Image Region)

Labels image regions such as charts, photographs, diagrams, or logos.

**Result Type**: `pdfregion` without `isTable`

**Use Cases**:
- Image detection and classification
- Chart/graph identification
- Logo and visual element marking

**Example**:

```json
{
  "id": "result_image_001",
  "from_name": "image_labels",
  "to_name": "pdf",
  "type": "pdfregion",
  "value": {
    "x": 20.0,
    "y": 50.0,
    "width": 60.0,
    "height": 30.0,
    "page": 1,
    "text": "Quarterly Revenue Chart"
  }
}
```

**Fields**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `value.x` | number | Yes | Region X position (0-100%) |
| `value.y` | number | Yes | Region Y position (0-100%) |
| `value.width` | number | Yes | Region width (0-100%) |
| `value.height` | number | Yes | Region height (0-100%) |
| `value.page` | integer | Yes | Page number (1-based) |
| `value.rotation` | number | No | Rotation in degrees (default: 0) |
| `value.text` | string | No | Description (max 1000 chars) |

**Distinguishing from TableLabel**:
- ImageLabel does **NOT** have `isTable` field (or `isTable: false`)
- ImageLabel does **NOT** have `row_lines`, `col_lines`, `cellTexts`, or `cells`
- The applied label typically indicates image type (Chart, Photo, Logo, etc.)

---

## Edge Cases

### Multi-Page Text Selection
- Text spanning multiple pages creates separate annotation results for each page
- The `position` object can track page ranges using `page` and `lineEnd` fields

### Overlapping Regions
- Multiple regions can cover the same area
- Each region is independent; overlaps are permitted
- Common when different label types apply to the same content

### Empty Regions
- Regions with no extractable text are valid
- `text` or `extractedText` fields will be empty or absent
- Useful for images or visual elements without text content

### Rotated Pages
- Coordinates are relative to the rendered (post-rotation) page
- The `rotation` field in region values tracks any additional rotation

### Multiple Labels on Same Area
- The same content area can have multiple label types
- Each label creates a separate annotation result
- Example: Text selected AND marked as part of a table

---

## Entity Relationship Diagram

```
AnnotationResult (base)
    ├── DocumentLabel (type="choices")
    │       └── value.choices[] ─── string[]
    │
    ├── TextLabel (type="pdftexthighlight")
    │       ├── value.text, page, tokenStart, tokenEnd
    │       ├── value.x, y, width, height (bbox)
    │       └── value.position? ─── Position object
    │
    └── RegionLabel (type="pdfregion")
            ├── TableLabel (isTable=true)
            │       ├── value.x, y, width, height, page (bbox)
            │       ├── value.row_lines[], col_lines[]
            │       ├── value.cellTexts{} ─── "row-col" → text
            │       └── value.cells[]? ─── Cell objects
            │
            └── ImageLabel (isTable absent/false)
                    ├── value.x, y, width, height, page (bbox)
                    └── value.text? (description)
```

---

## Complete Annotation Export Example

A document with all annotation types:

```json
{
  "id": 12345,
  "data": {
    "pdf": "/data/upload/7/financial_report.pdf"
  },
  "annotations": [
    {
      "id": 1,
      "result": [
        {
          "id": "doc_class_001",
          "from_name": "document_type",
          "to_name": "pdf",
          "type": "choices",
          "value": {
            "choices": ["Financial Report", "Q4 2025"]
          }
        },
        {
          "id": "text_001",
          "from_name": "entities",
          "to_name": "pdf",
          "type": "pdftexthighlight",
          "value": {
            "text": "Revenue: $1.2M",
            "page": 1,
            "tokenStart": 45,
            "tokenEnd": 48,
            "x": 15.0,
            "y": 25.0,
            "width": 20.0,
            "height": 3.0
          }
        },
        {
          "id": "table_001",
          "from_name": "tables",
          "to_name": "pdf",
          "type": "pdfregion",
          "value": {
            "isTable": true,
            "x": 10.0,
            "y": 40.0,
            "width": 80.0,
            "height": 35.0,
            "page": 2,
            "row_lines": [0, 25, 50, 75, 100],
            "col_lines": [0, 33.3, 66.6, 100],
            "cellTexts": {
              "0-0": "Metric",
              "0-1": "Q3",
              "0-2": "Q4",
              "1-0": "Revenue",
              "1-1": "$1.0M",
              "1-2": "$1.2M"
            }
          }
        },
        {
          "id": "image_001",
          "from_name": "images",
          "to_name": "pdf",
          "type": "pdfregion",
          "value": {
            "x": 60.0,
            "y": 10.0,
            "width": 35.0,
            "height": 25.0,
            "page": 1,
            "text": "Company Logo"
          }
        }
      ]
    }
  ]
}
```

---

## XML Configuration Templates

This section provides Label Studio XML configuration templates that produce the annotation outputs documented above. The XML configuration defines **what labelling capabilities are available**; the JSON output (documented above) shows **what gets exported** when those labels are applied.

### Configuration vs Output

| XML Tag | Produces Output Type | Use Case |
|---------|---------------------|----------|
| `<Choices>` + `<Choice>` | `choices` | Document classification |
| `<PdfLabels>` + `<Label>` | `pdftexthighlight` | Text/word selection |
| `<PdfLabels>` + `<Label>` | `pdfregion` | Table and image regions |

### Core Tags

#### PdfOcr

The `<PdfOcr>` tag renders the PDF document and enables annotation:

```xml
<PdfOcr name="pdf" value="$pdf_url"
  zoomcontrol="true"
  rotatecontrol="true"
  pagenavigation="true"/>
```

| Attribute | Type | Description |
|-----------|------|-------------|
| `name` | string | Reference name for other tags (required) |
| `value` | string | Data field containing PDF URL (required) |
| `zoomcontrol` | boolean | Show zoom controls |
| `rotatecontrol` | boolean | Show rotation controls |
| `pagenavigation` | boolean | Show page navigation |

#### PdfLabels

The `<PdfLabels>` tag enables text selection and region drawing:

```xml
<PdfLabels name="entities" toName="pdf">
  <Label value="Date" background="#FFA39E"/>
  <Label value="Amount" background="#D4380D"/>
</PdfLabels>
```

| Attribute | Type | Description |
|-----------|------|-------------|
| `name` | string | Control name (appears in `from_name`) |
| `toName` | string | Reference to PdfOcr tag |

#### Choices

The `<Choices>` tag enables document-level classification:

```xml
<Choices name="document_type" toName="pdf" choice="single">
  <Choice value="Invoice"/>
  <Choice value="Contract"/>
</Choices>
```

| Attribute | Type | Description |
|-----------|------|-------------|
| `name` | string | Control name (appears in `from_name`) |
| `toName` | string | Reference to PdfOcr tag |
| `choice` | string | `single` or `multiple` selection mode |

#### Label

The `<Label>` tag defines individual label options:

```xml
<Label value="Header" background="#FFA39E"/>
```

| Attribute | Type | Description |
|-----------|------|-------------|
| `value` | string | Label text (appears in output) |
| `background` | string | Hex color for highlighting |

---

### Template: Document Classification

For whole-document classification (produces `choices` output):

```xml
<View>
  <PdfOcr name="pdf" value="$pdf_url"/>
  <Choices name="document_type" toName="pdf" choice="single">
    <Choice value="Invoice"/>
    <Choice value="Contract"/>
    <Choice value="Report"/>
  </Choices>
</View>
```

---

### Template: Text/Entity Labelling

For word and phrase selection (produces `pdftexthighlight` output):

```xml
<View>
  <PdfOcr name="pdf" value="$pdf_url"
    zoomcontrol="true"
    rotatecontrol="true"
    pagenavigation="true"/>
  <PdfLabels name="entities" toName="pdf">
    <Label value="Date" background="#FFA39E"/>
    <Label value="Amount" background="#D4380D"/>
    <Label value="Name" background="#FFC069"/>
  </PdfLabels>
</View>
```

---

### Template: Table Region Labelling

For table detection and structure (produces `pdfregion` with `isTable=true`):

```xml
<View>
  <PdfOcr name="pdf" value="$pdf_url"
    zoomcontrol="true"
    rotatecontrol="true"
    pagenavigation="true"/>
  <PdfLabels name="tables" toName="pdf">
    <Label value="Table" background="#D4380D"/>
  </PdfLabels>
</View>
```

---

### Template: Image Region Labelling

For image/chart marking (produces `pdfregion` without `isTable`):

```xml
<View>
  <PdfOcr name="pdf" value="$pdf_url"/>
  <PdfLabels name="images" toName="pdf">
    <Label value="Chart" background="#52C41A"/>
    <Label value="Photo" background="#1890FF"/>
    <Label value="Logo" background="#722ED1"/>
  </PdfLabels>
</View>
```

---

### Template: Complete Configuration (All Label Types)

A comprehensive configuration supporting all annotation types:

```xml
<View>
  <PdfOcr name="pdf" value="$pdf_url"
    zoomcontrol="true"
    rotatecontrol="true"
    pagenavigation="true"/>

  <!-- Document Classification -->
  <Choices name="document_type" toName="pdf" choice="single">
    <Choice value="Invoice"/>
    <Choice value="Contract"/>
    <Choice value="Report"/>
  </Choices>

  <!-- Text/Entity Labels -->
  <PdfLabels name="entities" toName="pdf">
    <Label value="Header" background="#FFA39E"/>
    <Label value="Date" background="#FFC069"/>
    <Label value="Amount" background="#AD8B00"/>
  </PdfLabels>

  <!-- Table Labels -->
  <PdfLabels name="tables" toName="pdf">
    <Label value="Table" background="#D4380D"/>
  </PdfLabels>

  <!-- Image Labels -->
  <PdfLabels name="images" toName="pdf">
    <Label value="Chart" background="#52C41A"/>
    <Label value="Logo" background="#722ED1"/>
  </PdfLabels>
</View>
```

---

## Files

| File | Description |
|------|-------------|
| `schema-v1.yaml` | Machine-readable schema definition (YAML) |
| `config.xml` | Ready-to-use Label Studio XML configuration with all label types |
| `README.md` | This documentation file |

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2026-01-16 | Added XML configuration templates |
| 1.0.0 | 2026-01-16 | Initial release with all label types |
