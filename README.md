# Label Studio PDF Labeling Fork

A customized fork of [Label Studio](https://github.com/HumanSignal/label-studio) with enhanced PDF annotation capabilities for document understanding and machine learning workflows.

## Overview

This fork extends Label Studio with specialized features for PDF document labeling:

- **PDF OCR with Table Structure Annotation** - Native PDF viewing, region labeling with OCR text extraction, and table structure annotation using gridlines
- **PDF Text Labeling** - Direct text selection and highlighting with position tracking (page + line numbers)
- **Annotation Export** - Machine-readable export formats with document layout context and stable structural IDs

## Quick Start

### Prerequisites

- **Python 3.10+** (3.12 recommended)
- **Node.js 22+**
- **Yarn** (v1.x)
- **Poetry** (Python package manager)

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd lularge_label-studio

# Install Python dependencies
pip install poetry
poetry install

# Install frontend dependencies
cd web
yarn install --frozen-lockfile
cd ..

# Copy environment template (first time only)
cp .env.example .env
```

### Configuration

Port settings are stored in `.env` (copied from `.env.example`). Both the backend and frontend read from this file, ensuring they stay in sync.

| Variable | Default | Description |
|----------|---------|-------------|
| `DJANGO_PORT` | 8080 | Backend server port |
| `FRONTEND_PORT` | 8010 | Frontend dev server port |
| `DJANGO_HOSTNAME` | http://localhost:8080 | Full backend URL (for proxy) |
| `FRONTEND_HOSTNAME` | http://localhost:8010 | Full frontend URL |

To change ports, edit `.env` — no need to modify multiple files.

### Running the Application

> **Important:** You need **TWO separate terminal windows**. The backend **MUST** be running before you start the frontend.

**Step 1 — Start the Backend (Terminal 1):**
```bash
# First time only: run migrations
make migrate-dev

# Start the backend server
make run-dev
```
✓ **Verify:** You should see `Starting development server at http://127.0.0.1:8080/`

**Step 2 — Start the Frontend (Terminal 2):**
```bash
cd web
yarn dev
```
✓ **Verify:** You should see `webpack compiled successfully` and the dev server running on port 8010

**Step 3 — Open the Application:**

Navigate to **http://localhost:8010** in your browser.

> **Note:** The frontend dev server runs on port 8010 and proxies API requests to the backend on port 8080.

### Troubleshooting Startup Issues

| Error | Cause | Fix |
|-------|-------|-----|
| `Error occurred while trying to proxy: localhost:8010/` | Backend not running | Start the backend first with `make run-dev` |
| `Port 8080 already in use` | Another process using port | Run `lsof -i :8080` to find PID, then `kill <PID>` |
| `Port 8010 already in use` | Another process using port | Run `lsof -i :8010` to find PID, then `kill <PID>` |

## Custom Features

### 001 - PDF OCR with Table Structure Annotation
**Branch:** `001-pdf-ocr-tables` | **Status:** Specification Complete

- Native PDF viewing with page navigation, zoom, and rotation
- Region labeling (HEADER, PARAGRAPH, FOOTER, TABLE) with automatic OCR text extraction
- Table structure annotation using draggable row/column gridlines
- Cell-level text extraction and editing

### 002 - PDF Text Labeling
**Branch:** `002-pdf-text-label` | **Status:** Implemented

- Capture text content from bounding box regions
- Direct text highlighting in PDF documents (like browser text selection)
- Position tracking with page number and line reference
- Edit and view text labels in the region panel

### 003 - Annotation Export
**Branch:** `003-annotation-export` | **Status:** In Progress

- Export annotations with full document layout context (words, lines, blocks, tables)
- Stable annotation references with deterministic structural IDs
- JSONL export format with multi-span support
- W3C Web Annotation JSON-LD format support

**Detailed specifications:** See the `specs/` directory for comprehensive feature documentation.

## Project Structure

```
lularge_label-studio/
├── label_studio/          # Django backend
│   ├── core/              # Settings and configuration
│   ├── data_export/       # Export functionality
│   ├── ocr/               # OCR features
│   └── ...
├── web/                   # Frontend monorepo (NX)
│   ├── apps/
│   │   └── labelstudio/   # Main React application
│   └── libs/
│       ├── editor/        # Label Studio Frontend (LSF)
│       ├── datamanager/   # Data exploration tool
│       └── core/          # Shared utilities
├── specs/                 # Feature specifications
│   ├── 001-pdf-ocr-tables/
│   ├── 002-pdf-text-label/
│   └── 003-annotation-export/
└── DEVELOPMENT.md         # Detailed development guide
```

## Development

For detailed development instructions, including all available commands, architecture details, and troubleshooting, see **[DEVELOPMENT.md](./DEVELOPMENT.md)**.

### Quick Commands

| Command | Description |
|---------|-------------|
| `make run-dev` | Start backend server (port 8080) |
| `make migrate-dev` | Run database migrations |
| `cd web && yarn dev` | Start frontend dev server (port 8010) |
| `cd web && yarn lsf:watch` | Watch mode for editor library |
| `cd web && yarn test:unit` | Run unit tests |
| `cd web && yarn lint` | Run linter |

## Contributing

This project follows a spec-driven development workflow:

1. **Check the spec** in `specs/{feature}/spec.md` for requirements
2. **Review the tasks** in `specs/{feature}/tasks.md` for implementation checklist
3. **Follow the plan** in `specs/{feature}/plan.md` for approach

For code standards and contribution guidelines, see [CONTRIBUTING.md](./CONTRIBUTING.md).

### Branch Naming

- `001-pdf-ocr-tables` - PDF OCR and table annotation feature
- `002-pdf-text-label` - PDF text labeling feature
- `003-annotation-export` - Annotation export feature
- `develop` - Main development branch

## Upstream

This is a fork of [HumanSignal/label-studio](https://github.com/HumanSignal/label-studio). For upstream Label Studio documentation, visit [labelstud.io](https://labelstud.io/).

## License

This software is licensed under the [Apache 2.0 LICENSE](./LICENSE) © [HumanSignal](https://www.humansignal.com/). 2020-2025
