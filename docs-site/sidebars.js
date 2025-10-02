/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Introduction',
    },
    {
      type: 'doc',
      id: 'getting-started',
      label: 'Getting Started',
    },
    {
      type: 'doc',
      id: 'api/mcpShell',
      label: 'mcpShell()',
    },
    {
      type: 'doc',
      id: 'api/callTool',
      label: '.callTool()',
    },
    {
      type: 'doc',
      id: 'api/getResource',
      label: '.getResource()',
    },
    {
      type: 'doc',
      id: 'api/toHaveTool',
      label: '.toHaveTool()',
    },
    {
      type: 'doc',
      id: 'api/toHaveTools',
      label: '.toHaveTools()',
    },
    {
      type: 'doc',
      id: 'api/toHaveResource',
      label: '.toHaveResource()',
    },
    {
      type: 'doc',
      id: 'api/toHaveResources',
      label: '.toHaveResources()',
    },
    {
      type: 'doc',
      id: 'api/types',
      label: 'Type Definitions',
    },
  ],
};

module.exports = sidebars;
