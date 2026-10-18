import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {rankMcpTools} from '../lib/tool-discovery.js';
import {zh,en} from '../lib/host-locales.js';
test('search advertises actual bound and never duplicates full tool schema',()=>{
 const source=fs.readFileSync(fileURLToPath(new URL('../lib/index.js',import.meta.url)),'utf8');
 assert(source.includes('maximum: 8'));
 assert(source.includes('type: "integer"'));
 const segment=source.slice(source.indexOf('const lines = picked.map'),source.indexOf('const lines = picked.map')+350);
 assert(!segment.includes('tool.parameters'));
 assert(!zh.toolSearchLimit.includes('20'));
 assert(!en.toolSearchLimit.includes('20'));
 const pool=Array.from({length:12},(_,i)=>({name:'mcp__a__search'+i,description:'query'}));
 assert.equal(rankMcpTools('search',pool,20).length,8);
});
