<div align="center">
  <img src="docs/images/website-preview.webp" alt="Website Preview" width="720" />
  <h1><a href="https://www.robertmolina.dev/">My Personal Website</a></h1>
</div>

<p align="center">
  <a href="https://www.robertmolina.dev/">
    <img src="https://img.shields.io/badge/Website-robertmolina.dev-111111?logo=vercel&logoColor=white" alt="Website" />
  </a>
  <a href="https://rmolinamir.github.io/personal/">
    <img src="https://img.shields.io/badge/Storybook-Live-ff4785?logo=storybook&logoColor=white" alt="Storybook" />
  </a>
</p>

<p align="center">
  This is an OS-inspired personal site with a desktop shell, windowed apps, and playful system interactions.
  The experience is meant to feel like a lightweight desktop: icons on the wallpaper, windowed apps, and system overlays.
</p>

---

## Repository Structure

This is a monorepo powered by [Turborepo](https://turborepo.dev/) and [pnpm](https://pnpm.io/). See [`pnpm-workspace.yaml`](./pnpm-workspace.yaml) for monorepo layout.

---

## What Lives Here

- **Web Application:** Found in [`apps/web`](./apps/web). Powered by TanStack Start, built by Vite and Nitro.
- **Packages**: Found in [`packages`](./packages). Includes UI components, OS-themed windowing system, and other shared utilities.
- **Specs:** Found in [`specs`](./specs). The roadmap tracks upcoming work; completed feature specs live in [`specs/archive`](./specs/archive).

---

## Architecture

### Core Logic

- [`apps/web/src/routes`](./apps/web/src/routes): Tanstack Router is used to orchestrate navigation and routing within the application.
- [`apps/web/src/routes/-components`](./apps/web/src/routes/-components): Includes the website's core components, such as the System, Desktop, Applications, and OS-themed framework integration.

### Component Library

- [`packages/ui/src/os`](./packages/ui/src/os): This is the implementation of the OS-themed components.

### Styling

- [`apps/web/src/styles.css`](./apps/web/src/styles.css): These are the CSS styles of the website.
- [`packages/ui/src/styles.css`](./packages/ui/src/styles.css): And these are the base CSS styles of the pure components.

### Stories

- [`apps/storybook/src`](./apps/storybook/src): Interactive stories for the site's UI and windowing components. Stories with `play` cover visual interactions in a browser.

---

## Roadmap

See the [Roadmap](./specs/roadmap.md) for more details on what's to come.

---

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
