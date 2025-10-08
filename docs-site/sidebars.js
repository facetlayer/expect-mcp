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
      id: 'matchers',
      label: 'Matchers',
    },
    {
      type: 'doc',
      id: 'types',
      label: 'Types',
    },
    {
      type: 'doc',
      id: 'mcpShell',
      label: 'mcpShell()',
    },
    {
      type: 'doc',
      id: 'callTool',
      label: 'app.callTool()',
    },
    {
      type: 'doc',
      id: 'readResource',
      label: 'app.readResource()',
    },
    {
      type: 'doc',
      id: 'ToolCallResult',
      label: 'ToolCallResult',
    },
    {
      type: 'doc',
      id: 'ReadResourceResult',
      label: 'ReadResourceResult',
    },
    {
      type: 'doc',
      id: 'toHaveTool',
      label: '.toHaveTool()',
    },
    {
      type: 'doc',
      id: 'toHaveTools',
      label: '.toHaveTools()',
    },
    {
      type: 'doc',
      id: 'toHaveResource',
      label: '.toHaveResource()',
    },
    {
      type: 'doc',
      id: 'toHaveResources',
      label: '.toHaveResources()',
    },
    {
      type: 'doc',
      id: 'toBeSuccessful',
      label: '.toBeSuccessful()',
    },
    {
      type: 'doc',
      id: 'toHaveTextContent',
      label: '.toHaveTextContent()',
    },
    {
      type: 'doc',
      id: 'toMatchTextContent',
      label: '.toMatchTextContent()',
    },
    {
      type: 'doc',
      id: 'toHaveResourceContent',
      label: '.toHaveResourceContent()',
    },
    {
      type: 'doc',
      id: 'toHaveTextResource',
      label: '.toHaveTextResource()',
    },
  ],
};

module.exports = sidebars;
