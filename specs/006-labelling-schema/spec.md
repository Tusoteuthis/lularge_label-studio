# Feature Specification: PDF Document Labelling Schema

**Feature Branch**: `006-labelling-schema`
**Created**: 2026-01-15
**Status**: Draft
**Input**: User description: "Create a comprehensive labelling schema that captures the full extent of PDF document annotation including: document labels (whole document classification), word and text labels (in-document text selection), table labels (structured data regions), and image labels (image region identification). Save as versioned file under /labelling_scheme directory."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Schema Documentation Reference (Priority: P1)

A developer or data scientist needs to understand the complete labelling capabilities of the PDF annotation system to design annotation workflows or integrate with downstream data pipelines.

**Why this priority**: Without clear documentation of the labelling schema, users cannot effectively design annotation projects or build systems that consume annotation data. This is foundational to all other use cases.

**Independent Test**: Can be fully tested by opening the schema file and verifying it contains all documented label types with their properties and structures.

**Acceptance Scenarios**:

1. **Given** a user needs to understand available label types, **When** they open the schema file, **Then** they see a comprehensive list of all label types (document, text, table, image) with clear descriptions
2. **Given** a user needs to know the data structure of annotations, **When** they read the schema, **Then** they understand exactly what fields and values each label type produces
3. **Given** a user needs to version their annotation format, **When** they reference the schema, **Then** they can identify the schema version being used

---

### User Story 2 - Document-Level Classification (Priority: P1)

An annotator needs to classify an entire PDF document with a single label (e.g., "Invoice", "Contract", "Report") to categorize documents for downstream processing.

**Why this priority**: Document classification is a fundamental annotation task that enables document routing, filtering, and batch processing workflows.

**Independent Test**: Can be tested by creating a document label annotation and verifying the schema correctly describes its structure.

**Acceptance Scenarios**:

1. **Given** a PDF document is loaded, **When** the annotator applies a document-level label, **Then** the schema describes how the entire document is classified
2. **Given** multiple document type options exist, **When** the annotator selects one, **Then** the schema captures the selected classification value

---

### User Story 3 - Word and Text Labelling (Priority: P1)

An annotator needs to select and label specific words, phrases, or multi-line text spans within a PDF to extract named entities, key information, or text segments.

**Why this priority**: Text extraction is the core use case for PDF annotation - identifying specific pieces of information within documents.

**Independent Test**: Can be tested by selecting text and verifying the schema captures word positions, text content, and label information.

**Acceptance Scenarios**:

1. **Given** a PDF with extractable text, **When** the annotator selects a single word and applies a label, **Then** the schema captures the word text, position, page number, and label
2. **Given** a multi-line text span, **When** the annotator selects across lines and applies a label, **Then** the schema captures the full text span with start/end positions
3. **Given** token-based selection is available, **When** the annotator selects words, **Then** the schema includes token indices for precise reconstruction

---

### User Story 4 - Table Region Labelling (Priority: P2)

An annotator needs to identify and label table regions within a PDF, including the ability to define row/column structure and extract cell contents.

**Why this priority**: Tables contain structured data that requires special handling beyond simple text extraction. This enables structured data extraction workflows.

**Independent Test**: Can be tested by drawing a table region and verifying the schema captures bounding box, gridlines, and cell data.

**Acceptance Scenarios**:

1. **Given** a PDF containing a table, **When** the annotator draws a bounding box around the table, **Then** the schema captures the region coordinates and "table" label type
2. **Given** a table region is defined, **When** the annotator adds row/column gridlines, **Then** the schema captures the gridline positions
3. **Given** table cells are defined, **When** text is extracted or entered for cells, **Then** the schema captures cell text mapped to row/column indices

---

### User Story 5 - Image Region Labelling (Priority: P2)

An annotator needs to identify and label image regions within a PDF, such as charts, photographs, diagrams, or logos.

**Why this priority**: Images in documents require separate handling for downstream processing like image classification or OCR.

**Independent Test**: Can be tested by drawing a region around an image and verifying the schema captures the image region with its label.

**Acceptance Scenarios**:

1. **Given** a PDF containing an embedded image, **When** the annotator draws a bounding box around it, **Then** the schema captures the region as an image type
2. **Given** an image region is identified, **When** the annotator applies a classification label (e.g., "chart", "photo"), **Then** the schema captures the image type classification

---

### Edge Cases

- What happens when text spans multiple pages? Schema must support multi-page text selections with page range tracking.
- How are overlapping regions handled? Each region is independent; overlaps are permitted.
- What if a region contains no extractable text? Region is still valid with empty text field.
- How are rotated pages represented in coordinates? Coordinates are relative to the rendered page (post-rotation).
- What happens when the same area is labelled with multiple label types? Each label creates a separate annotation result.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a versioned schema file that documents all supported label types
- **FR-002**: System MUST define the data structure for document-level classification labels
- **FR-003**: System MUST define the data structure for word/text selection labels including position, page, and text content
- **FR-004**: System MUST define the data structure for table region labels including bounding box, gridlines, and cell mappings
- **FR-005**: System MUST define the data structure for image region labels including bounding box and classification
- **FR-006**: System MUST use a machine-readable format that supports both human reading and programmatic validation
- **FR-007**: System MUST include schema versioning to track changes over time
- **FR-008**: System MUST document the coordinate system used for spatial annotations (percentage-based 0-100%)
- **FR-009**: System MUST document page numbering conventions (1-based)
- **FR-010**: System MUST provide human-readable documentation alongside the schema definition

### Key Entities

- **DocumentLabel**: Represents a classification applied to an entire document; key attributes include label value and document reference
- **TextLabel**: Represents labelled text within a document; key attributes include text content, page number, token positions, bounding box, and label value
- **TableLabel**: Represents a labelled table region; key attributes include bounding box, page number, row/column gridlines, cell text mappings, and label value
- **ImageLabel**: Represents a labelled image region; key attributes include bounding box, page number, image type classification, and label value
- **Position**: Represents spatial location; key attributes include page, coordinates (x, y, width, height as percentages), and optional token indices

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Schema file is complete when it documents 100% of the label types (document, text, table, image) with all their properties
- **SC-002**: Schema is machine-readable when it can be parsed without errors by standard YAML parsers
- **SC-003**: Schema is human-readable when a new developer can understand the annotation structure within 10 minutes of reading
- **SC-004**: Documentation completeness is achieved when README includes examples for each label type
- **SC-005**: Version tracking is successful when schema version is clearly identifiable in the file
- **SC-006**: Schema accurately reflects the existing annotation output format as implemented in the codebase

## Assumptions

- YAML format is chosen as the best fit: human-readable, machine-parseable, supports comments, diff-friendly
- Schema will be stored at `/labelling_scheme/schema-v1.yaml` with accompanying `README.md`
- Coordinate system uses percentage-based values (0-100%) for page-independent positioning
- Page numbers are 1-based
- The schema documents the annotation output format, not the Label Studio XML configuration format
- Existing PdfRegion and PdfTextHighlight implementations define the source of truth for data structures

## Out of Scope

- Automatic schema validation of annotation exports (future enhancement)
- Schema migration tools between versions (future enhancement)
- Label Studio XML configuration template generation from schema (separate feature)
- Runtime schema enforcement in the application (separate feature)
