# Quickstart: PDF Document Labelling Schema

**Feature**: 006-labelling-schema

## Overview

This feature creates a versioned labelling schema that documents the annotation output format for PDF documents. No code changes are required - this is purely documentation.

## Files to Create

| File | Purpose |
|------|---------|
| `labelling_scheme/schema-v1.yaml` | Machine-readable schema definition |
| `labelling_scheme/README.md` | Human-readable documentation with examples |

## Implementation Steps

### Step 1: Create Directory

```bash
mkdir -p labelling_scheme
```

### Step 2: Create Schema File

Create `labelling_scheme/schema-v1.yaml` with:
- Schema version header
- All label type definitions
- Field types and validation rules
- Examples for each type

### Step 3: Create Documentation

Create `labelling_scheme/README.md` with:
- Overview of the labelling system
- Quick reference for each label type
- Complete examples
- Coordinate system explanation

## Verification

1. **YAML Validity**: Parse schema with any YAML parser
   ```bash
   python -c "import yaml; yaml.safe_load(open('labelling_scheme/schema-v1.yaml'))"
   ```

2. **Completeness**: Verify all 4 label types documented:
   - Document labels (Choices)
   - Text labels (PdfTextHighlight)
   - Table labels (PdfRegion with isTable=true)
   - Image labels (PdfRegion)

3. **Accuracy**: Compare schema against actual annotation exports from the application

## Key Decisions

- **Format**: YAML (human-readable, machine-parseable, supports comments)
- **Coordinates**: Percentage-based (0-100) for page independence
- **Page Numbers**: 1-based (matches user-facing numbering)
- **Version**: v1 (initial release)

## No Dependencies

This feature has no code dependencies. It documents existing functionality.
