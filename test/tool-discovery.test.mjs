import test from 'node:test';
import assert from 'node:assert/strict';
import {searchTokens,rankMcpTools,ScopedToolHotset} from '../lib/tool-discovery.js';
const pool=[
 {name:'mcp__amap-maps__maps_direction_driving',description:'Plan driving directions'},
 {name:'mcp__amap-maps__maps_direction_walking',description:'Walking directions'},
 {name:'mcp__amap-maps__maps_weather',description:'Weather forecast'},
 {name:'mcp__amap-maps__maps_text_search',description:'Search locations'},
 {name:'mcp__example__other',description:'其他任务'}];
test('Chinese queries produce semantic matching, without empty-query first-tool fallback',()=>{
 assert(searchTokens('导航到广州塔').includes('direction'));
 const chosen=rankMcpTools('导航到广州塔',pool,3);
 assert(chosen.length>=1);
 assert(chosen.some(tool=>tool.name.includes('maps_direction')));
 assert.equal(rankMcpTools('',pool).length,0);
 assert.equal(rankMcpTools('%%%',pool).length,0);
 assert.equal(rankMcpTools('天气预报',pool,3)[0].name,'mcp__amap-maps__maps_weather');
});
test('English search, caps, deterministic ordering and no false positives',()=>{
 assert.equal(rankMcpTools('driving directions',pool)[0].name,'mcp__amap-maps__maps_direction_driving');
 assert.equal(rankMcpTools('nonsense_unknown_search_term',pool).length,0);
 assert(rankMcpTools('maps',pool,2).length<=2);
 assert.equal(rankMcpTools('maps',Array.from({length:25},(_,i)=>({name:'mcp__maps__maps_'+i,description:'maps'})),20).length,8,'returned tools must match the per-session hot cap');
 assert.deepEqual(rankMcpTools('maps',pool,3),rankMcpTools('maps',pool,3));
});
test('Session hotsets isolate tools, cap each Session and evict old Session state',()=>{
 const s=new ScopedToolHotset({sessionLimit:2,toolsPerSession:2});
 for(const tool of ['mcp__a__one','mcp__a__two','mcp__a__three'])s.touch('session-1',tool);
 assert.deepEqual(s.names('session-1'),['mcp__a__two','mcp__a__three']);
 s.touch('session-2','mcp__b__secret');
 assert.deepEqual(s.names('session-1'),['mcp__a__two','mcp__a__three']);
 assert.deepEqual(s.names('session-2'),['mcp__b__secret']);
 assert.equal(s.touch(undefined,'mcp__x__missing'),false);
 s.deleteTool('mcp__a__two');
 assert.deepEqual(s.names('session-1'),['mcp__a__three']);
 s.touch('session-3','mcp__c__four');
 assert.deepEqual(s.names('session-1'),[]);
 assert.deepEqual(s.names('session-2'),['mcp__b__secret']);
 assert.equal(s.sessionCount,2);
 s.clear();assert.equal(s.size,0);
});
