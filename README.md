# My Portfolio Website with Astro & Three.js
This is a personal portfolio website built with a brutalist-inspired aesthetic, leveraging the power of modern web technologies like Astro, Three.js, and CSS animations. The project focuses on creating a unique, performant, and highly interactive user experience.

## ✨ Features
- Seamless Page Transitions: Utilizes Astro's View Transitions API to create smooth, app-like navigation without full page reloads.
- Dynamic Theming: Each page section (/idea, /craft, etc.) features its own unique color scheme, which is applied globally and transitions smoothly between pages.
- Custom Animations:
- A unique 3D page-flip effect for content transitions.
- An interactive navigation bar where the active page title and menu items animate in and out on navigation.
- Interactive Particle Logo: The homepage features a high-performance, interactive logo built with Three.js (WebGL). The SVG logo is deconstructed into a particle system that reacts to the user's cursor movements in real-time.
- Infinite Marquee Banner: A seamlessly looping announcement banner at the bottom of the landing page, built with pure CSS animations.
- Type-Safe Content Management: Blog posts and articles are managed through Astro's Content Collections, using MDX for a rich authoring experience with type-safety provided by Zod schemas.
- Fully Responsive Design: The layout, typography, and interactive elements are designed to work flawlessly across all devices, from mobile phones to large desktop screens.

## 🛠️ Tech Stack
- Framework: Astro
- 3D/WebGL: Three.js
- Animations: Astro View Transitions API, CSS Animations
- Styling: CSS with Custom Properties
- Content: Astro Content Collections, MDX

#### Development Environment: Docker Dev Container
#### Deployment: Cloudflare Pages

## 🧞 Commands
All commands are run from the root of the project, from a terminal:
| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

