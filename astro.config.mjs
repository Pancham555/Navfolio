// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import pagefind from 'astro-pagefind';

import tailwindcss from '@tailwindcss/vite';

import expressiveCode from 'astro-expressive-code';

import vercel from '@astrojs/vercel';

// const isGitHubActions = process.env.GITHUB_ACTIONS === 'true';
// const customSite = process.env.SITE_URL;
// const customBase = process.env.SITE_BASE;
// const repositoryOwner = process.env.GITHUB_REPOSITORY_OWNER;
// const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1];
// const isProjectPage =
//   Boolean(repositoryOwner) &&
//   Boolean(repositoryName) &&
//   repositoryName !== `${repositoryOwner}.github.io`;

// const githubPagesSite =
//   repositoryOwner && repositoryName
//     ? `https://${repositoryOwner}.github.io${isProjectPage ? `/${repositoryName}` : ''}`
//     : undefined;

// const resolvedSite =
//   customSite || (isGitHubActions && githubPagesSite ? githubPagesSite : 'https://example.com');

// const resolvedBase =
//   customBase || (isGitHubActions && isProjectPage && repositoryName ? `/${repositoryName}` : '/');

// https://astro.build/config
export default defineConfig({
  site: 'https://panchamfolio.vercel.app',
  // base: resolvedBase,
  output: 'static',
  integrations: [react(), expressiveCode(), mdx(), sitemap(), keystatic(), pagefind()],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: vercel(),
});