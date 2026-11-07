import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { isMcpToolAdmitted, setMcpToolAdmission } from '../lib/tool-admission.js';

test('MCP tools default to available without an owning manager', () => {
  assert.equal(isMcpToolAdmitted('mcp__alpha__read', 'session-a'), true);
});

test('manager policy preserves disabled-tools and session-specific search hot sets', () => {
  const disabled = new Set(['mcp__alpha__write']);
  const hot = new Map([['session-a', new Set(['mcp__alpha__read'])], ['session-b', new Set()]]);
  let mode = 'search';
  const dispose = setMcpToolAdmission((name, sessionId) =>
    !disabled.has(name) && (mode !== 'search' || hot.get(sessionId)?.has(name) === true));
  try {
    assert.equal(isMcpToolAdmitted('mcp__alpha__read', 'session-a'), true);
    assert.equal(isMcpToolAdmitted('mcp__alpha__read', 'session-b'), false);
    assert.equal(isMcpToolAdmitted('mcp__alpha__write', 'session-a'), false);
    mode = 'full';
    assert.equal(isMcpToolAdmitted('mcp__alpha__read', 'session-b'), true);
    assert.equal(isMcpToolAdmitted('mcp__alpha__write', 'session-a'), false);
  } finally { dispose(); }
  assert.equal(isMcpToolAdmitted('mcp__alpha__write', 'session-a'), true);
});

test('step admission is registered at the MCP client; assembly is guarded for new hosts', () => {
  const client = readFileSync(new URL('../lib/mcp-client.js', import.meta.url), 'utf8');
  const manager = readFileSync(new URL('../lib/index.js', import.meta.url), 'utf8');
  assert.match(client, /ctx\.tools\.register\(definition,\s*\{\s*when:/);
  assert.match(manager, /Array\.isArray\(assembly\?\.tools\)/);
  assert.match(manager, /if \(legacyTools !== null\) assembly\.tools = kept/);
  assert.match(manager, /setMcpToolAdmission\(/);
});
