# Tasks: PDF Document Labelling Schema

**Input**: Design documents from `/specs/006-labelling-schema/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓

**Tests**: No automated tests required - this is a documentation-only feature. Manual validation only.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Schema files**: `labelling_scheme/` at repository root
- **Spec docs**: `specs/006-labelling-schema/`

---

## Phase 1: Setup

**Purpose**: Create directory structure and initialize files

- [x] T001 Create labelling_scheme directory in repository root: `mkdir -p labelling_scheme`
- [x] T002 [P] Create empty schema file: `labelling_scheme/schema-v1.yaml`
- [x] T003 [P] Create empty README file: `labelling_scheme/README.md`

---

## Phase 2: Foundational (Schema Header & Common Structures)

**Purpose**: Define schema version header and common structures that all label types depend on

**⚠️ CRITICAL**: Label type definitions in later phases depend on these common structures

- [x] T004 Add schema version header and metadata to `labelling_scheme/schema-v1.yaml`
- [x] T005 Define coordinate system documentation (percentage 0-100%) in `labelling_scheme/schema-v1.yaml`
- [x] T006 Define page numbering convention (1-based) in `labelling_scheme/schema-v1.yaml`
- [x] T007 Define AnnotationResult base structure in `labelling_scheme/schema-v1.yaml`
- [x] T008 Define Position embedded object schema in `labelling_scheme/schema-v1.yaml`
- [x] T009 [P] Add README overview section with project context in `labelling_scheme/README.md`

**Checkpoint**: Foundation ready - common structures defined

---

## Phase 3: User Story 1 - Schema Documentation Reference (Priority: P1) 🎯 MVP

**Goal**: Provide a complete, versioned schema file that developers can reference to understand all label types

**Independent Test**: Open `labelling_scheme/schema-v1.yaml` and verify it lists all 4 label types with their properties

### Implementation for User Story 1

- [x] T010 [US1] Add label types overview section to `labelling_scheme/schema-v1.yaml`
- [x] T011 [US1] Add schema version identifier (v1) clearly visible at top of `labelling_scheme/schema-v1.yaml`
- [x] T012 [US1] Add quick reference table to `labelling_scheme/README.md` listing all label types
- [x] T013 [US1] Validate YAML syntax: `python -c "import yaml; yaml.safe_load(open('labelling_scheme/schema-v1.yaml'))"`

**Checkpoint**: Schema file exists with version, overview of all types, parseable YAML

---

## Phase 4: User Story 2 - Document-Level Classification (Priority: P1)

**Goal**: Document the structure for whole-document classification labels (Choices)

**Independent Test**: Verify DocumentLabel section exists with choices array structure and example

### Implementation for User Story 2

- [x] T014 [P] [US2] Define DocumentLabel (type="choices") schema in `labelling_scheme/schema-v1.yaml`
- [x] T015 [US2] Add DocumentLabel field descriptions and validation rules in `labelling_scheme/schema-v1.yaml`
- [x] T016 [US2] Add DocumentLabel example to `labelling_scheme/README.md`
- [x] T017 [US2] Add document classification use case explanation to `labelling_scheme/README.md`

**Checkpoint**: Document-level labels fully documented

---

## Phase 5: User Story 3 - Word and Text Labelling (Priority: P1)

**Goal**: Document the structure for text selection labels (PdfTextHighlight)

**Independent Test**: Verify TextLabel section exists with text, page, tokenStart/End, and bounding box fields

### Implementation for User Story 3

- [x] T018 [P] [US3] Define TextLabel (type="pdftexthighlight") schema in `labelling_scheme/schema-v1.yaml`
- [x] T019 [US3] Add TextLabel field descriptions and validation rules in `labelling_scheme/schema-v1.yaml`
- [x] T020 [US3] Document token-based selection (tokenStart, tokenEnd) in `labelling_scheme/schema-v1.yaml`
- [x] T021 [US3] Add TextLabel single-word example to `labelling_scheme/README.md`
- [x] T022 [US3] Add TextLabel multi-line selection example to `labelling_scheme/README.md`

**Checkpoint**: Text selection labels fully documented

---

## Phase 6: User Story 4 - Table Region Labelling (Priority: P2)

**Goal**: Document the structure for table region labels with gridlines and cells

**Independent Test**: Verify TableLabel section exists with isTable, row_lines, col_lines, cells, and cellTexts

### Implementation for User Story 4

- [x] T023 [P] [US4] Define TableLabel (type="pdfregion", isTable=true) schema in `labelling_scheme/schema-v1.yaml`
- [x] T024 [P] [US4] Define Cell embedded object schema in `labelling_scheme/schema-v1.yaml`
- [x] T025 [US4] Add TableLabel field descriptions and validation rules in `labelling_scheme/schema-v1.yaml`
- [x] T026 [US4] Document gridline arrays (row_lines, col_lines) behavior in `labelling_scheme/schema-v1.yaml`
- [x] T027 [US4] Document cellTexts mapping format ("row-col" -> text) in `labelling_scheme/schema-v1.yaml`
- [x] T028 [US4] Add TableLabel with gridlines example to `labelling_scheme/README.md`

**Checkpoint**: Table region labels fully documented

---

## Phase 7: User Story 5 - Image Region Labelling (Priority: P2)

**Goal**: Document the structure for image region labels

**Independent Test**: Verify ImageLabel section exists with bounding box and classification text

### Implementation for User Story 5

- [x] T029 [P] [US5] Define ImageLabel (type="pdfregion") schema in `labelling_scheme/schema-v1.yaml`
- [x] T030 [US5] Add ImageLabel field descriptions in `labelling_scheme/schema-v1.yaml`
- [x] T031 [US5] Distinguish ImageLabel from TableLabel (isTable absent/false) in `labelling_scheme/schema-v1.yaml`
- [x] T032 [US5] Add ImageLabel example to `labelling_scheme/README.md`

**Checkpoint**: Image region labels fully documented

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation quality and completeness

- [x] T033 Add edge cases section to `labelling_scheme/README.md` (multi-page, overlapping, empty regions)
- [x] T034 Add entity relationship diagram to `labelling_scheme/README.md`
- [x] T035 Add "complete annotation export" example showing all types together in `labelling_scheme/README.md`
- [x] T036 Final YAML validation: `python -c "import yaml; yaml.safe_load(open('labelling_scheme/schema-v1.yaml'))"`
- [x] T037 Review schema accuracy against existing codebase (PdfRegion.jsx, PdfTextHighlight.jsx serialization)
- [x] T038 Update CLAUDE.md if needed to reference labelling_scheme documentation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - defines common structures
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can proceed in priority order (P1 → P2)
  - Within same priority, stories can run in parallel
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 3 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 4 (P2)**: Can start after Foundational - No dependencies on other stories
- **User Story 5 (P2)**: Can start after Foundational - No dependencies on other stories

### Parallel Opportunities

- T002, T003: Create schema and README files in parallel
- T009: README overview can be written while schema header is being added
- T014, T018, T023, T029: All label type definitions can be written in parallel (different sections of same file)
- All US documentation tasks for README can run in parallel with schema tasks

---

## Parallel Example: P1 User Stories

```bash
# After Foundational phase, launch all P1 story schema definitions in parallel:
Task: "[US1] Add label types overview section to schema-v1.yaml"
Task: "[US2] Define DocumentLabel schema in schema-v1.yaml"
Task: "[US3] Define TextLabel schema in schema-v1.yaml"

# Then launch all P1 README documentation in parallel:
Task: "[US1] Add quick reference table to README.md"
Task: "[US2] Add DocumentLabel example to README.md"
Task: "[US3] Add TextLabel examples to README.md"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 - Schema Reference
4. Complete Phase 4: US2 - Document Labels
5. Complete Phase 5: US3 - Text Labels
6. **STOP and VALIDATE**: Schema has version, common structures, and core label types
7. **MVP COMPLETE**: Developers can reference document and text labelling

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 (schema overview) → Validate → Basic reference available
3. Add US2+US3 (P1 stories) → Validate → Core labelling documented (MVP!)
4. Add US4+US5 (P2 stories) → Validate → Full labelling documented
5. Add Polish → Final quality pass

---

## Summary

| Metric | Count |
|--------|-------|
| **Total Tasks** | 38 |
| **Setup Tasks** | 3 |
| **Foundational Tasks** | 6 |
| **US1 Tasks** | 4 |
| **US2 Tasks** | 4 |
| **US3 Tasks** | 5 |
| **US4 Tasks** | 6 |
| **US5 Tasks** | 4 |
| **Polish Tasks** | 6 |
| **Parallel Opportunities** | 12 tasks marked [P] |

**Suggested MVP Scope**: User Stories 1, 2, 3 (schema overview + document + text labels)

---

## Notes

- This is a documentation-only feature - no code implementation required
- [P] tasks = different files or different sections, no dependencies
- [Story] label maps task to specific user story for traceability
- YAML validation should be run after each schema modification
- Commit after each logical group of tasks
- Stop at any checkpoint to validate documentation independently
