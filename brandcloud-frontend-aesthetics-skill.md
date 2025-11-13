# Frontend Aesthetics Skill: BrandCloud

<frontend_aesthetics>

You tend to converge toward generic, on-distribution outputs. Avoid "AI slop." Create distinctive, brand-aligned frontends that surprise and delight while remaining accessible.

**Brand essence:** Bold, vibrant, modern tech — energetic, collaborative, digital-first

**Audience/use cases:** Digital asset management platform for creative teams, brand managers, and marketing professionals. Use cases include brand portal interfaces, collaboration tools, and file management dashboards.

**Focus areas:** Typography, Color & Theme, Motion, Backgrounds, Implementation Notes

**Global principles:**

- Commit to a cohesive aesthetic with strong hierarchy and decisive choices
- Use CSS variables (or theme tokens) for colors, spacing, and typography
- Avoid generic defaults: Inter, Roboto, Arial, system stacks; purple-on-white clichés; bland palettes; predictable layouts
- Prioritize accessibility: meet WCAG AA contrast; provide reduced-motion fallbacks
- Embrace vibrant, saturated colors as primary design language, not as accents

</frontend_aesthetics>

---

<typography>

**Primary font family:** Neue Haas Grotesk Display Pro (Roman, Medium)  
**Fallback stack:** Helvetica Neue, Arial, sans-serif

**Pairing principle:** Use a single, confident sans-serif family. Neue Haas Grotesk is clean, modern, geometric—perfect for tech. Leverage weight contrast (Roman 400 vs Medium 500) for hierarchy instead of multiple families.

**Weight ranges:**

- Display/Hero: Medium (500), size 3.5–5rem
- Headings: Medium (500), size 2–3rem
- Body: Roman (400), size 1–1.125rem
- UI/Small: Roman (400), size 0.875rem

**Loading approach:** Adobe Fonts (if available) or Google Fonts proxy:

```css
@import url("https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600&display=swap");

:root {
  --font-display: "Neue Haas Grotesk Display Pro", "Work Sans",
    "Helvetica Neue", Arial, sans-serif;
  --font-body: var(--font-display);

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.5rem;
  --text-2xl: 2rem;
  --text-3xl: 3rem;
  --text-4xl: 4rem;
}
```

</typography>

---

<color_and_theme>

**Primary theme:** Light mode with vibrant saturated colors  
**Philosophy:** Bold, unapologetic primaries—blue is king, supported by purple, cyan, yellow, coral. Use high saturation as brand signature, not decoration.

**Color tokens (RGB):**

```css
:root {
  /* Brand primaries */
  --bc-blue: rgb(0, 55, 255); /* Primary brand color */
  --bc-purple: rgb(150, 80, 255); /* Secondary accent */
  --bc-cyan: rgb(1, 221, 187); /* Fresh highlight */
  --bc-yellow: rgb(255, 214, 0); /* Energy accent */
  --bc-coral: rgb(255, 77, 66); /* Alert/danger */
  --bc-pink: rgb(241, 161, 232); /* Soft accent */

  /* Neutrals */
  --bc-grey-light: rgb(216, 216, 216);
  --bc-grey-mid: rgb(153, 153, 153);
  --bc-black: rgb(0, 0, 0);
  --bc-white: rgb(255, 255, 255);

  /* Semantic tokens */
  --bg: var(--bc-white);
  --surface: rgb(248, 248, 250);
  --text: var(--bc-black);
  --text-muted: var(--bc-grey-mid);
  --primary: var(--bc-blue);
  --accent: var(--bc-purple);
  --highlight: var(--bc-cyan);
  --danger: var(--bc-coral);
}
```

**Contrast guidance:** Ensure text on vibrant backgrounds meets WCAG AA. Use `--bc-white` for text over `--bc-blue`, `--bc-purple`, `--bc-coral`. Use `--bc-black` over `--bc-yellow`, `--bc-cyan`.

**Alternative theme (dark):**

```css
[data-theme="dark"] {
  --bg: rgb(10, 10, 15);
  --surface: rgb(20, 20, 30);
  --text: rgb(240, 240, 245);
  --text-muted: rgb(160, 160, 170);
  /* Keep brand colors vibrant in dark mode */
}
```

</color_and_theme>

---

<motion>

**Philosophy:** Use motion to emphasize hierarchy through orchestrated reveals. Favor a single dramatic entrance over scattered micro-interactions.

**CSS animation (page load fade-up):**

```css
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero {
  animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.card {
  animation: fadeSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: calc(var(--index) * 0.1s);
}

@media (prefers-reduced-motion: reduce) {
  .hero,
  .card {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
```

**React/Framer Motion snippet:**

```jsx
import { motion } from "framer-motion";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

<motion.div variants={staggerContainer} initial="hidden" animate="show">
  <motion.div variants={fadeUpItem}>Card 1</motion.div>
  <motion.div variants={fadeUpItem}>Card 2</motion.div>
</motion.div>;
```

</motion>

---

<backgrounds>

**Strategy:** Avoid flat fills. Use layered gradients with vibrant brand colors, subtle noise textures, or geometric grids. Embrace depth via blur and transparency.

**Layered gradient example:**

```css
.hero-bg {
  background: radial-gradient(
      circle at 20% 80%,
      rgba(1, 221, 187, 0.15) 0%,
      transparent 50%
    ), radial-gradient(
      circle at 80% 20%,
      rgba(150, 80, 255, 0.15) 0%,
      transparent 50%
    ), linear-gradient(135deg, rgb(248, 248, 250) 0%, rgb(255, 255, 255) 100%);
}

.card-surface {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(0, 55, 255, 0.1);
}

/* Subtle noise texture */
.section {
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E");
}
```

</backgrounds>

---

<implementation_notes>

**Tokens:** Centralize in `:root` CSS variables. Mirror in JS/TS theme object if using React + Tailwind.

**Component hierarchy:**

- Hero sections: Large type (--text-4xl), primary color backgrounds, dramatic motion
- Primary CTAs: Use `--bc-blue` or `--bc-purple` with hover transforms
- Cards: Subtle elevation via backdrop-filter, colored borders (not shadows)

**Grid/spacing:** 8px base unit. Vertical rhythm: 1.6 line-height for body, 1.2 for headings.

**Libraries:**

- Pure CSS preferred for maximum control
- If using Tailwind: extend with BrandCloud tokens
- shadcn/ui compatible—override default color palette

**Testing:**

- Contrast checker: ensure brand colors meet WCAG AA (4.5:1 text, 3:1 UI)
- Reduced motion: verify animations gracefully degrade
- Dark mode: test vibrant colors remain punchy

</implementation_notes>

---

<avoid>

- Inter, Roboto, Arial, system font stacks as primary choice
- Generic purple-on-white gradient trope (use BrandCloud's specific vibrant palette)
- Space Grotesk as "interesting" fallback
- Low-contrast text over images without overlays or blur
- Over-animated micro-interactions that distract
- Desaturated "safe" palettes—embrace the vibrant brand colors

</avoid>

---

<examples>

**HTML/CSS Hero Section:**

```html
<section class="hero">
  <div class="hero-bg"></div>
  <div class="hero-content">
    <h1 class="hero-title">Digital Assets, Unified</h1>
    <p class="hero-subtitle">Brand management for modern teams</p>
    <button class="cta-primary">Get Started</button>
  </div>
</section>

<style>
  .hero {
    position: relative;
    min-height: 70vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .hero-bg {
    position: absolute;
    inset: 0;
    background: radial-gradient(
        circle at 20% 80%,
        rgba(1, 221, 187, 0.2) 0%,
        transparent 50%
      ), radial-gradient(
        circle at 80% 20%,
        rgba(150, 80, 255, 0.2) 0%,
        transparent 50%
      ), linear-gradient(135deg, rgb(248, 248, 250) 0%, rgb(255, 255, 255) 100%);
    animation: fadeSlideUp 0.8s ease-out;
  }

  .hero-content {
    position: relative;
    z-index: 1;
    text-align: center;
    animation: fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s backwards;
  }

  .hero-title {
    font-family: var(--font-display);
    font-weight: 500;
    font-size: var(--text-4xl);
    color: var(--bc-blue);
    margin-bottom: 1rem;
  }

  .cta-primary {
    background: var(--bc-blue);
    color: white;
    padding: 1rem 2.5rem;
    border-radius: 8px;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .cta-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 55, 255, 0.3);
  }
</style>
```

</examples>

---

<assumptions>

Used BrandCloud demo brand assets from BrandCloud MCP: vibrant color palette (blue, purple, cyan, yellow, coral), Neue Haas Grotesk Display Pro typography. Assumed tech/SaaS audience with preference for bold, modern aesthetics and Google Fonts fallback compatibility. Assumed WCAG AA compliance required. Assumed light mode primary with dark mode variant support.

</assumptions>
