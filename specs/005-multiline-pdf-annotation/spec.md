# Feature Specification: Multi-Line PDF Text Annotation

**Feature Branch**: `005-multiline-pdf-annotation`
**Created**: 2026-01-14
**Status**: Draft
**Input**: User description: "Enable multi-line text annotation in PDFs - allow users to select and label text that spans multiple lines with a single annotation instead of creating separate labels for each line"

## Problem Statement

Currently, text annotations in PDF documents can only be applied to single lines of text. When annotating content that spans multiple lines (such as headlines, abstracts, paragraphs, or multi-line addresses), users must create separate labels for each line. This creates several issues:

1. **Fragmented annotations**: A single logical entity (e.g., a headline) is split across multiple annotations
2. **Increased effort**: Users must repeat the labeling process for each line
3. **Data quality issues**: Downstream ML training receives fragmented labels instead of cohesive entities
4. **Poor user experience**: Interrupts natural reading and annotation flow

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Multi-Line Text Selection (Priority: P1)

As a document annotator, I want to click and drag to select text that spans multiple lines in a PDF, so that I can create a single annotation for content like headlines, abstracts, or paragraphs that naturally flow across line breaks.

**Why this priority**: This is the core functionality that directly solves the user's primary pain point. Without multi-line selection, the feature has no value.

**Independent Test**: Can be fully tested by selecting a 3-line headline in a PDF and verifying that all three lines are captured in a single annotation with the chosen label.

**Acceptance Scenarios**:

1. **Given** a PDF document is open in the labeling interface, **When** I click at the start of text on line 1 and drag to text on line 3, **Then** all text from the start position to the end position (including intermediate lines) is highlighted as a single selection.

2. **Given** I have selected text spanning multiple lines, **When** I apply a label (e.g., "Headline"), **Then** a single annotation is created containing all the selected text with proper reading order preserved.

3. **Given** I have created a multi-line annotation, **When** I view the annotation in the results panel, **Then** it displays as a single entry with the complete text content.

---

### User Story 2 - Visual Feedback for Multi-Line Annotations (Priority: P2)

As a document annotator, I want clear visual feedback showing which text belongs to my multi-line annotation, so that I can verify I've selected the correct content.

**Why this priority**: Visual feedback is essential for accurate annotation work but depends on the core selection functionality (P1) being in place first.

**Independent Test**: Can be tested by creating a multi-line annotation and verifying the visual highlight spans all selected lines with consistent styling.

**Acceptance Scenarios**:

1. **Given** I am selecting text across multiple lines, **When** I drag the selection, **Then** each line in the selection is visually highlighted in real-time.

2. **Given** I have completed a multi-line annotation, **When** I hover over any part of it, **Then** the entire annotation (all lines) is highlighted together.

3. **Given** multiple multi-line annotations exist on the same page, **When** I view the document, **Then** each annotation's boundaries are clearly distinguishable.

---

### User Story 3 - Edit Multi-Line Annotations (Priority: P3)

As a document annotator, I want to modify or delete multi-line annotations, so that I can correct mistakes without re-annotating from scratch.

**Why this priority**: Editing capability improves efficiency but is not required for initial annotation creation.

**Independent Test**: Can be tested by creating a multi-line annotation, then deleting it or changing its label.

**Acceptance Scenarios**:

1. **Given** a multi-line annotation exists, **When** I click on it and press delete, **Then** the entire annotation (all lines) is removed.

2. **Given** a multi-line annotation exists, **When** I select it and choose a different label, **Then** the label is updated for the entire annotation.

---

### Edge Cases

- **Page boundary**: Multi-line selection is limited to a single page. Cross-page selections will create separate annotations per page.

- **Non-text elements**: Only text content is captured; embedded images/tables within the selection are ignored.

- **Mixed font styles**: All text is captured regardless of formatting; style information is preserved in the extracted text.

- **RTL text**: Reading order follows the PDF's native text flow; RTL text is handled according to PDF structure.

- **Overlapping annotations**: Overlapping annotations are allowed; users can create annotations that share text regions.

- **Partial word selection**: System handles text selection that starts or ends mid-word at boundaries.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to click and drag to select text spanning multiple consecutive lines within a single PDF page.

- **FR-002**: System MUST preserve the reading order of selected text across line breaks (e.g., "This is a\nlong headline" becomes "This is a long headline").

- **FR-003**: System MUST apply a single label to the entire multi-line selection, creating one annotation record.

- **FR-004**: System MUST visually highlight all lines of a multi-line selection during the selection process.

- **FR-005**: System MUST visually indicate the full extent of saved multi-line annotations (all lines highlighted together).

- **FR-006**: System MUST allow deletion of multi-line annotations as a single unit.

- **FR-007**: System MUST allow changing the label of a multi-line annotation without re-selecting the text.

- **FR-008**: System MUST store multi-line annotations in a format compatible with the existing annotation export (including the ML export format developed in feature 003).

- **FR-009**: System MUST maintain backward compatibility with existing single-line annotations.

- **FR-010**: System MUST handle text selection that starts or ends mid-word (partial word selection at boundaries).

### Key Entities

- **Annotation**: Represents a labeled text region; extended to support multiple bounding boxes (one per line) while maintaining a single logical identity.

- **Text Selection**: A contiguous range of text defined by start and end positions in the document's text layer, potentially spanning multiple visual lines.

- **Bounding Box Set**: A collection of rectangular regions (one per line) that together represent the visual extent of a multi-line annotation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a multi-line annotation (spanning 3+ lines) in a single click-drag action, completing the task in under 5 seconds.

- **SC-002**: 100% of text content within a multi-line selection is captured in the annotation (no missing characters or lines).

- **SC-003**: Multi-line annotations export correctly to both standard Label Studio format and the ML export format, with all text and bounding boxes preserved.

- **SC-004**: Users report the annotation workflow for multi-line content is "easier" or "much easier" compared to the previous line-by-line approach (qualitative feedback).

- **SC-005**: No increase in annotation errors (missed content, incorrect labels) when using multi-line selection compared to single-line selection.

## Assumptions

1. Multi-line selection is constrained to a single PDF page (cross-page selection is out of scope for this feature).
2. The existing PDF text layer extraction (pdfplumber) provides sufficient positional information for multi-line text ranges.
3. Users interact via mouse click-and-drag; keyboard-only or touch interactions follow the same underlying selection model.
4. The annotation data model can be extended to store multiple bounding boxes per annotation without breaking existing functionality.
5. Performance remains acceptable for documents up to 100 pages with hundreds of annotations.

## Out of Scope

- Cross-page text selection (selecting text that spans a page break)
- Table cell selection as multi-line annotations
- Selection of non-contiguous text regions (e.g., selecting line 1 and line 3 but not line 2)
- Automatic detection of multi-line entities (user must manually select)
