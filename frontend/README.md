# DevCollab Frontend

React + Vite single-page app for DevCollab.

## Setup

```bash
npm install
npm run dev      # http://localhost:5173
npm run lint
npm run build
npm run preview
```

## Configuration

The API base URL defaults to `http://localhost:8080/api`. Point it somewhere else with a `.env` file:

```bash
VITE_API_BASE_URL=https://your-api.example.com/api
```

The backend CORS allowlist is controlled by the `CORS_ALLOWED_ORIGINS` environment variable — add your
deployed origin there if you host this app somewhere new.

## Structure

```txt
src/
├── api/api.js          # fetch wrapper, ApiError, media/github helpers
├── components/         # Sidebar, ProjectCard, Avatar, Toast, GithubIcon
├── modals/             # CreateProjectModal, ProjectDetailPanel
├── pages/              # AuthPage, Dashboard, ProfilePage
└── styles/global.css   # design tokens, base inputs, animations
```

Styling is plain CSS with custom properties (design tokens live in `styles/global.css`); components
apply styles inline. There is no CSS framework or router — `App.jsx` owns the two-page navigation.