//
// --------------------------------------------------------------
/**
 * keystatic.config.ts — Navfolio CMS
 *
 * Covers every collection and singleton in astro-navfolio:
 *   • blog      → src/content/blog/*
 *   • projects  → src/content/projects/*
 *   • vibe      → src/content/vibe/*
 *   • about     → src/content/about.mdx  (singleton)
 *
 * ─── Prerequisites ──────────────────────────────────────────────────────────
 *
 *   bun add @keystatic/core @keystatic/astro
 *
 * ─── Wire into Astro ────────────────────────────────────────────────────────
 *
 *   // astro.config.mjs
 *   import keystatic from '@keystatic/astro';
 *   export default defineConfig({
 *     output: 'hybrid',              // Keystatic admin needs SSR
 *     integrations: [..., keystatic()],
 *   });
 *
 *   // src/pages/keystatic/[...params].ts
 *   export { all as ALL } from '@keystatic/astro/api';
 *
 *   // src/pages/keystatic.astro
 *   ---
 *   import { KeystaticApp } from '@keystatic/astro/ui';
 *   ---
 *   <KeystaticApp />
 *
 * ─── Storage note ───────────────────────────────────────────────────────────
 *
 *   'local' mode reads/writes directly to disk — perfect for dev.
 *   Switch to GitHub mode for a hosted CMS that commits via the GitHub API:
 *
 *   storage: {
 *     kind: 'github',
 *     repo: 'your-user/your-repo',
 *   }
 *
 * ─── Vibe filename convention ────────────────────────────────────────────────
 *
 *   Vibe notes use a YYYY-MM-DD-<slug> filename (e.g. 2026-06-06-photo-note).
 *   Keystatic derives the slug from the title field and will NOT auto-prepend
 *   the date. Two options:
 *     a) Create via CLI: `bun run vibe:new <slug> [--mdx]` (recommended).
 *     b) In the Keystatic UI, manually edit the Slug field after typing the
 *        title to prepend the date (YYYY-MM-DD-).
 */

import { config, collection, singleton, fields } from '@keystatic/core';

// ─────────────────────────────────────────────────────────────────────────────
// Shared image-field factories
// (keeps directory/publicPath consistent across collections)
// ─────────────────────────────────────────────────────────────────────────────

const figureImage = (label = 'Hero Image') =>
  fields.image({
    label,
    description: 'Stored in src/assets/figure/. Referenced as /src/assets/figure/<filename>.',
    directory: 'src/assets/figure/',
    publicPath: 'src/assets/figure/',
  });

// ─────────────────────────────────────────────────────────────────────────────
// Shared sidebar object
// (blog, projects, and about all have the same sidebar frontmatter shape)
// ─────────────────────────────────────────────────────────────────────────────

const sidebarObject = (defaults: { enable: boolean; toc: boolean; relatedPosts: boolean }) =>
  fields.object(
    {
      enable: fields.checkbox({
        label: 'Show Sidebar',
        defaultValue: defaults.enable,
      }),
      toc: fields.checkbox({
        label: 'Table of Contents',
        defaultValue: defaults.toc,
      }),
      relatedPosts: fields.checkbox({
        label: 'Related Posts',
        defaultValue: defaults.relatedPosts,
      }),
    },
    { label: 'Sidebar' },
  );

// ─────────────────────────────────────────────────────────────────────────────
// Shared tag / category / series array factory
// ─────────────────────────────────────────────────────────────────────────────

const textArray = (label: string, description?: string) =>
  fields.array(fields.text({ label: label.replace(/s$/, '') }), {
    label,
    ...(description ? { description } : {}),
    itemLabel: (props) => props.value || label.replace(/s$/, ''),
  });

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

export default config({
  storage: {
    kind: 'github',
    repo: 'Pancham555/Navfolio',
  },

  ui: {
    brand: {
      name: 'Pancham folio',
    },
  },

  // ───────────────────────────────────────────────────────────────────────────
  // COLLECTIONS
  // ───────────────────────────────────────────────────────────────────────────

  collections: {
    // ── Blog ────────────────────────────────────────────────────────────────
    //
    // Files: src/content/blog/<slug>.mdx  (or .md for plain Markdown posts)
    // Routes: /blog/<slug>
    //
    // Created via CLI: bun run post:new <slug> [--mdx]
    // ────────────────────────────────────────────────────────────────────────
    blog: collection({
      label: 'Blog',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        // ── Identity ──────────────────────────────────────────────────────
        title: fields.slug({
          name: {
            label: 'Title',
            description: 'Display title of the post. The slug is derived from this.',
          },
        }),

        description: fields.text({
          label: 'Description',
          description: 'Short summary shown in the blog archive and <meta description>.',
          multiline: true,
          validation: { isRequired: true },
        }),

        date: fields.date({
          label: 'Publication Date',
          description: 'ISO 8601 datetime (e.g. 2026-06-06T06:37:19.447Z). Defaults to now.',
          defaultValue: { kind: 'today' },
          validation: { isRequired: true },
          // defaultValue: `${new Date()}`,
        }),

        draft: fields.checkbox({
          label: 'Draft',
          description: 'Draft posts are hidden from the production build.',
          defaultValue: false,
        }),

        // ── Hero image ────────────────────────────────────────────────────
        heroImage: figureImage(),

        showHeroImage: fields.checkbox({
          label: 'Show Hero Image',
          defaultValue: false,
        }),

        // ── Taxonomy ──────────────────────────────────────────────────────
        tags: textArray('Tags', 'Free-form labels shown in the article header.'),

        categories: textArray(
          'Categories',
          'Category keys defined in your site config / categories-series-guide.',
        ),

        series: textArray(
          'Series',
          'Series keys this post belongs to. See categories-series-guide.',
        ),

        // ── Behaviour ─────────────────────────────────────────────────────
        comments: fields.checkbox({
          label: 'Enable Comments',
          description: 'Per-post override. The global default is set in site.toml.',
          defaultValue: true,
        }),

        sidebar: sidebarObject({ enable: true, toc: true, relatedPosts: true }),

        // ── Body ──────────────────────────────────────────────────────────
        content: fields.mdx({
          label: 'Content',
          // Add your custom MDX component allowlist here when you create
          // components under src/components/mdx/:
          //
          // components: {
          //   Note: component({ importsFrom: '~/components/mdx/Note.astro' }),
          // },
        }),
      },
    }),

    // ── Projects ────────────────────────────────────────────────────────────
    //
    // Files: src/content/projects/<slug>.mdx
    // Routes: /projects/<slug>
    //
    // Shares the same article schema as blog. Categories and series are
    // omitted — project pages are typically standalone.
    // Sidebar defaults are flipped: no sidebar, but TOC is on if re-enabled.
    // ────────────────────────────────────────────────────────────────────────
    projects: collection({
      label: 'Projects',
      slugField: 'title',
      path: 'src/content/projects/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.slug({
          name: {
            label: 'Title',
            description: 'Display title of the project.',
          },
        }),

        description: fields.text({
          label: 'Description',
          multiline: true,
          validation: { isRequired: true },
        }),

        date: fields.date({
          label: 'Date',
          defaultValue: { kind: 'today' },
          // defaultValue: `${new Date()}`,
        }),

        draft: fields.checkbox({
          label: 'Draft',
          defaultValue: false,
        }),

        heroImage: figureImage(),

        showHeroImage: fields.checkbox({
          label: 'Show Hero Image',
          defaultValue: false,
        }),

        tags: textArray('Tags'),

        comments: fields.checkbox({
          label: 'Enable Comments',
          defaultValue: false,
        }),

        // Projects typically use a centred, no-sidebar layout
        sidebar: sidebarObject({ enable: false, toc: true, relatedPosts: false }),

        content: fields.mdx({ label: 'Content' }),
      },
    }),

    // ── Vibe ────────────────────────────────────────────────────────────────
    //
    // Files: src/content/vibe/YYYY-MM-DD-<slug>.mdx
    // Routes: /vibe (timeline, no individual pages)
    //
    // See the date-prefix note at the top of this file.
    // Created via CLI: bun run vibe:new <slug> [--mdx]
    // ────────────────────────────────────────────────────────────────────────
    vibe: collection({
      label: 'Vibe',
      slugField: 'title',
      path: 'src/content/vibe/*',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        // ── Identity ──────────────────────────────────────────────────────
        title: fields.slug({
          name: {
            label: 'Title',
            description:
              'Short label for this fragment. When creating in the UI, prepend the ' +
              'date to the Slug field (YYYY-MM-DD-<slug>) to match the naming convention.',
          },
        }),

        date: fields.date({
          label: 'Date',
          description: 'Creation datetime (ISO 8601).',
          defaultValue: { kind: 'today' },
          validation: { isRequired: true },
          // defaultValue: `${new Date()}`,
        }),

        updatedDate: fields.date({
          label: 'Updated Date',
          description: 'Set automatically by bun scripts; update manually when editing.',
          defaultValue: { kind: 'today' },
          validation: { isRequired: true },
          // defaultValue: `${new Date()}`,
        }),

        draft: fields.checkbox({
          label: 'Draft',
          defaultValue: false,
        }),

        // ── Fragment type ─────────────────────────────────────────────────
        type: fields.select({
          label: 'Type',
          description: 'Semantic / visual type that the renderer uses to style the card.',
          options: [
            { label: 'Text', value: 'text' },
            { label: 'Photo', value: 'photo' },
            { label: 'Quote', value: 'quote' },
            { label: 'Code', value: 'code' },
            { label: 'Mixed', value: 'mixed' },
          ],
          defaultValue: 'text',
        }),

        // ── Optional meta ─────────────────────────────────────────────────
        mood: fields.text({
          label: 'Mood',
          description: 'Optional mood keyword or emoji (e.g. 🌧️ rainy, focused).',
        }),

        location: fields.text({
          label: 'Location',
          description: 'Optional location tag (e.g. Guwahati, home-office).',
        }),

        // ── Media ─────────────────────────────────────────────────────────
        images: fields.array(
          fields.image({
            label: 'Image',
            description: 'Served from public/images/vibe/.',
            directory: 'public/images/vibe',
            publicPath: '/images/vibe/',
          }),
          {
            label: 'Images',
            description: 'One or more photos attached to this vibe fragment.',
            itemLabel: () => 'Image',
          },
        ),

        // ── Taxonomy ──────────────────────────────────────────────────────
        tags: textArray('Tags'),

        // ── Layout ───────────────────────────────────────────────────────
        align: fields.select({
          label: 'Align',
          description: 'Horizontal alignment of the note card in the timeline.',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ],
          defaultValue: 'left',
        }),

        size: fields.select({
          label: 'Size',
          description: 'Width preset of the note card.',
          options: [
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' },
          ],
          defaultValue: 'md',
        }),

        // ── Body ──────────────────────────────────────────────────────────
        content: fields.mdx({ label: 'Content' }),
      },
    }),
  },

  // ───────────────────────────────────────────────────────────────────────────
  // SINGLETONS
  // ───────────────────────────────────────────────────────────────────────────

  singletons: {
    // ── About ───────────────────────────────────────────────────────────────
    //
    // File: src/content/about.mdx
    // Route: /about
    //
    // Uses the same article schema as blog/projects but with sidebar and
    // comments disabled by default — the About page typically uses a
    // centred, no-sidebar layout.
    // ────────────────────────────────────────────────────────────────────────
    about: singleton({
      label: 'About',
      path: 'src/content/about',
      format: { contentField: 'content' },
      entryLayout: 'content',
      schema: {
        title: fields.text({
          label: 'Title',
          defaultValue: 'About',
        }),

        description: fields.text({
          label: 'Description',
          multiline: true,
        }),

        date: fields.date({
          label: 'Date',
          description: 'Last meaningful update date (YYYY-MM-DD).',
        }),

        draft: fields.checkbox({
          label: 'Draft',
          defaultValue: false,
        }),

        heroImage: figureImage(),

        showHeroImage: fields.checkbox({
          label: 'Show Hero Image',
          defaultValue: false,
        }),
        tags: textArray('Tags'),

        comments: fields.checkbox({
          label: 'Enable Comments',
          defaultValue: false,
        }),

        sidebar: sidebarObject({ enable: false, toc: false, relatedPosts: false }),

        content: fields.mdx({ label: 'Content' }),
      },
    }),
  },
});
