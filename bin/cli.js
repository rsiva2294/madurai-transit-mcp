#!/usr/bin/env node

import('../dist/index.js').catch((err) => {
  console.error("Failed to start Madurai Transit MCP server:", err);
  process.exit(1);
});
