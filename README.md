# Sorplos — corporate site

Static implementation of the `Sorplos Website.dc.html` design
([Claude Design project](https://claude.ai/design/p/ae45754e-9477-4870-83e6-a95322980d03)).

No build step and no dependencies. Open `index.html` directly, or serve the
folder for correct relative paths:

```sh
npx http-server -p 8080
```

## Structure

```
index.html            Homepage
ventures/eureka.html  Eureka venture detail
assets/css/site.css   Tokens, components, responsive rules
assets/js/site.js     Ventures dropdown + mobile menu
```

## Design system

Tokens live in `:root` at the top of `site.css`, transcribed from the design's
token-sheet artboard.

| Token           | Value     | Role                    |
| --------------- | --------- | ----------------------- |
| `--ink`         | `#060B10` | Page base               |
| `--ink-raised`  | `#0C141B` | Cards                   |
| `--hairline`    | `#16222C` | 1px borders, never fill |
| `--bone`        | `#E8EDF0` | Primary text            |
| `--muted`       | `#7C8F9B` | Secondary text          |
| `--eureka`      | `#4DE0C0` | Venture 01              |
| `--insure`      | `#F5A524` | Venture 02              |
| `--reserved`    | `#8B7CFF` | Held for venture 03     |

Type: Clash Display (headings), Satoshi (body), JetBrains Mono (labels), loaded
from Fontshare and Google Fonts.

The accent rule from the design: two accents on one surface means you are looking
at the group; one accent means you are looking at a venture. The homepage stays
neutral and lets each venture own its colour; `ventures/eureka.html` is teal
throughout.

## Breakpoints

- **≥1081px** — the 1440 artboard: 1280px shell, 80px gutters, three-column grids.
- **721–1080px** — same composition, 48px gutters, fixed columns collapse.
- **≤720px** — the 390 artboard: 58px header with the menu toggle, stacked CTAs,
  and the spine diagram rotated onto a vertical rail with horizontal connectors.

## Notes on the implementation

- **Venture links.** The design wires the homepage Eureka card to
  `eureka.sorplos.com`, which would leave the venture-detail artboard unreachable.
  The Eureka card, nav dropdown and footer link to `ventures/eureka.html` instead,
  and that page carries the prominent link out to the product. Sorplos Insure has
  no detail artboard, so it still links straight to `insure.sorplos.com`.
- **One responsive page.** The mobile artboard shortens some body copy. Since both
  artboards are the same page, the desktop copy is used at every width.
- **Operating principles.** The design puts `padding-top` on the element carrying
  the hairline divider background, which renders as a solid 44px slab. Changed to
  `margin-top`.
- **Dropdown.** The design opens the Ventures menu on hover. Hover is kept for
  fine pointers, with click, `Escape` and focus-out handling added so it works
  by keyboard and on touch.
- **Motion.** Entrance animations use `both` fill, so the `prefers-reduced-motion`
  block explicitly releases opacity and transform — otherwise disabling the
  animation would strand elements on their invisible first frame.
- **Grain.** One fixed, non-interactive overlay per page at 3% opacity, rather
  than the per-artboard overlay the canvas uses.

## Motion

The canvas only animates on load, which leaves everything below the fold static.
Added, all extending the design's own "signal travelling along a hairline" motif
rather than generic fades:

- **Scroll reveals.** Sections, cards and rows rise and fade in as they enter
  view, staggered 70ms between siblings. `data-reveal` is applied *from JS*, so
  with scripting off nothing is ever hidden.
- **Hairline sweeps.** A pulse of accent light runs the length of each `.rule`
  over 3.2s as it comes into view, and replays every time the divider re-enters.
  Direction follows travel: scrolling down sweeps left to right, scrolling back
  up sweeps right to left. Dividers therefore keep their own observer and are
  never unobserved, unlike the other reveal targets.
- **Breathing status LEDs.** Live and waitlist dots pulse continuously, offset
  from each other.
- **Ambient hero glows.** A teal and a faint amber radial drift on long,
  mismatched cycles — two accents on one surface, which per the design's own
  rule reads as the group rather than a venture.
- **Accent hover glows** on venture cards.

Two things worth knowing if you edit this:

- The glows deliberately bleed past the shell into the gutter, so `main` carries
  `overflow-x: clip`. Clipping on `body` does not work — body overflow propagates
  to the viewport and still reports the full scroll width — and `hidden` instead
  of `clip` would create a scroll container and break the sticky header.
- The `IntersectionObserver` bottom `rootMargin` creates a dead zone that the
  last elements on a page can never leave, so a scroll/resize `flush()` reveals
  anything still hidden once the page bottom is reached. Without it the footer
  stays invisible permanently.

## Not implemented

The token sheet (artboard 01) and the four-card ventures grid (artboard 05) are
design references, not pages. The four-card rule is encoded in the ventures grid:
`repeat(auto-fit, minmax(330px, 1fr))` keeps three cards on one row and pairs
them into rows of two from four cards up.
