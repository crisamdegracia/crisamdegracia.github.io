# crisamdegracia.github.io

Personal portfolio of Crisam "Sam" De Gracia: AI automation and technical SEO, founder of [Auriros](https://auriros.com).

Live at https://crisamdegracia.github.io/

## What it is

A static, build-free single page served by GitHub Pages.

- A 3D character (Three.js) that follows the cursor, with scroll-driven scenes (GSAP ScrollTrigger + Lenis)
- A horizontal "My Work" section, a physics "techstack" (cannon-es) and a looping tools marquee
- Plain HTML content, so it still reads without JavaScript

Libraries load from CDNs with pinned versions (see the import map and script tags in `index.html`).

## Layout

| Path | What |
| --- | --- |
| `index.html` | The page and all its content |
| `css/site.css` | Styles |
| `js/main.js` | Scroll choreography, accordion, marquee, project spotlight, contact form |
| `js/character.js` | The 3D character and the fixed canvas |
| `js/techstack.js` | The falling logo spheres |
| `assets/images/` | Logos and images (`work/` holds the WebP project thumbnails) |
| `v1/` | The previous site (2024), kept online but `noindex` |

The old site is also saved as the git tag `v1-2024` and the branch `archive-v1-2024`.

## Run it locally

Modules need a server, so don't open the file directly:

```bash
python -m http.server 5174
```

then open http://localhost:5174/. Google Tag Manager is skipped on `localhost`, so dev visits don't reach analytics.

## Analytics

Google Tag Manager `GTM-W7LJDQ3J` (GA4 stream `G-YE1C3HM5SW`). The contact form pushes a `generate_lead` event to the `dataLayer`.

## Notes

- Project thumbnails: add a screenshot to `assets/images/`, convert it to a 16:10 WebP in `assets/images/work/`, and add a card in `index.html`. Numbers are automatic.
- The page respects `prefers-reduced-motion`.
