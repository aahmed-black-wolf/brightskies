# AI Pipeline Editor - Frontend

A visual pipeline editor built with React and React Flow that allows users to create, connect, and execute AI pipeline nodes through an intuitive drag-and-drop interface.

> 📖 For detailed design decisions and implementation approach, see [DESIGN.md](./DESIGN.md)

## Prerequisites

- **Node.js**: v18 or higher (v18-alpine is used in Docker)
- **npm** or **bun**: For package management (Dockerfile uses bun)
- **Docker** (optional): For containerized deployment
- **Backend API**: The application expects a backend API running at `http://localhost:8000` (or configurable via `BACKEND_URL` environment variable in Docker)

## Setup Instructions

### Local Development

1. **Install dependencies:**

   ```bash
   npm install
   # or
   bun install
   ```

2. **Start the development server:**

   ```bash
   npm run dev
   # or
   bun run dev
   ```

   The application will be available at `http://localhost:3000`

3. **Ensure backend API is running:**
   The frontend expects a backend API at `http://localhost:8000/api/nodes` that returns an array of node types:
   ```json
   [
     { "id": "1", "name": "Data Source" },
     { "id": "2", "name": "Transformer" },
     { "id": "3", "name": "Model" },
     { "id": "4", "name": "Sink" }
   ]
   ```

### Docker Deployment

1. **Build the Docker image:**

   ```bash
   docker build -t pipeline-editor-frontend .
   ```

2. **Run the container:**

   ```bash
   docker run -p 80:80 -e BACKEND_URL=http://your-backend:8000 pipeline-editor-frontend
   ```

   The application will be available at `http://localhost`

   **Note:** The `BACKEND_URL` environment variable is optional and defaults to `http://mock-api:8000`. The docker-entrypoint.sh script replaces the placeholder in nginx.conf at runtime.

### Building for Production

```bash
npm run build
# or
bun run build
```

The production build will be in the `dist/` directory.

### Running Tests

```bash
npm test
# or with UI
npm run test:ui
```

## Architecture

### Technology Stack

- **React 18**: UI framework
- **TypeScript**: Type safety
- **React Flow v11**: Visual node-based editor
- **TanStack Query (React Query)**: Server state management and API fetching
- **Tailwind CSS**: Styling
- **Vite**: Build tool and dev server
- **Vitest**: Testing framework
- **Nginx**: Production web server (Docker)

### State Management

The application uses a **hybrid state management approach**:

1. **Server State (React Query)**:

   - Node types fetched from the backend API
   - Cached and managed by `@tanstack/react-query`
   - Automatically handles loading states, errors, and refetching

2. **Local Component State (React useState)**:

   - **Nodes**: Array of React Flow nodes representing pipeline components
   - **Edges**: Array of connections between nodes
   - **Logs**: Execution logs displayed in real-time
   - **Execution State**: Boolean flag tracking if pipeline is currently executing

3. **State Flow**:
   ```
   User Action → Event Handler → State Update → React Re-render → UI Update
   ```

### Component Architecture

```
App (Root)
├── NodePalette (Left Sidebar)
│   └── Fetches and displays available node types
├── PipelineCanvas (Center)
│   └── ReactFlow instance with custom nodes
│       └── CustomNode (Custom node component)
└── ExecutionLog (Right Sidebar)
    └── Displays execution logs in real-time
```

### Key Features

- **Drag-and-Drop**: Nodes can be dragged from the palette onto the canvas
- **Visual Connections**: Nodes can be connected via edges (arrows)
- **Topological Sort**: Execution order is determined using topological sorting
- **Cycle Detection**: Prevents invalid connections that would create cycles
- **Real-time Execution**: Visual feedback during pipeline execution with status updates
- **Responsive Design**: Mobile-friendly layout with adaptive UI

### Pipeline Execution Logic

1. **Validation**: Ensures at least one node exists
2. **Topological Sort**: Determines execution order based on node dependencies
3. **Sequential Execution**: Nodes execute one at a time in dependency order
4. **Status Updates**: Each node transitions through states: `idle` → `running` → `completed`
5. **Logging**: Execution logs are generated and displayed in real-time

## Assumptions

1. **Backend API**: Assumes a REST API endpoint at `/api/nodes` that returns node type definitions
2. **Node Types**: Assumes four standard node types: "Data Source", "Transformer", "Model", and "Sink"
3. **Execution**: Currently uses simulated execution with 1-second delays per node (not connected to actual backend execution)
4. **Browser Support**: Modern browsers with ES6+ support (Chrome, Firefox, Safari, Edge)

## Limitations

1. **No Persistence**: Pipeline configurations are not saved to backend or local storage
2. **No Undo/Redo**: No history management for node/edge operations
3. **No Node Configuration**: Nodes cannot be configured with parameters or settings
4. **Simulated Execution**: Pipeline execution is simulated client-side, not connected to actual backend execution engine
5. **No Error Recovery**: If a node fails during execution, the pipeline stops (no retry mechanism)
6. **No Data Preview**: Cannot preview data flowing through nodes
7. **Limited Validation**: Basic cycle detection but no validation of node type compatibility
8. **No Export/Import**: Cannot save or load pipeline configurations

## Incomplete Features (Due to Time Constraints)

1. **Backend Integration**: Execution is simulated; real backend API integration for actual pipeline execution is not implemented
2. **Node Configuration Panel**: No UI for configuring node parameters
3. **Pipeline Persistence**: No save/load functionality for pipelines
4. **Advanced Validation**: No validation for node type compatibility (e.g., ensuring Data Source outputs match Transformer inputs)
5. **Multi-select and Bulk Operations**: Cannot select multiple nodes for deletion or movement
6. **Keyboard Shortcuts**: No keyboard shortcuts for common operations
7. **Node Templates**: No pre-built pipeline templates
8. **Execution History**: No history of past executions
9. **Error Handling UI**: Limited error handling and user feedback for edge cases
10. **Accessibility**: Basic accessibility features implemented, but could be enhanced

## Development Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm test`: Run tests
- `npm run test:ui`: Run tests with UI
- `npm run lint`: Run ESLint

## Project Structure

```
frontend/
├── src/
│   ├── app.tsx              # Main application component
│   ├── components/
│   │   ├── custom-node.tsx  # Custom React Flow node component
│   │   ├── execution-log.tsx # Execution log sidebar
│   │   ├── node-palette.tsx # Node type palette sidebar
│   │   └── pipeline-canvas.tsx # React Flow canvas wrapper
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── utils/
│   │   ├── api.ts           # API client functions
│   │   ├── pipeline.ts      # Pipeline execution logic
│   │   └── pipeline.test.ts # Unit tests
│   └── main.tsx             # Application entry point
├── Dockerfile               # Docker build configuration
├── docker-entrypoint.sh    # Docker entrypoint script
├── nginx.conf              # Nginx configuration
└── package.json            # Dependencies and scripts
```
