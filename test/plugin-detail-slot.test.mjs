import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../lib/client.js',import.meta.url),'utf8');
const imports=[...new Set([...source.matchAll(/\brequire\(['"]([^'"]+)['"]\)/g)].map(x=>x[1]))];
const registered=[];
let exports;
const fakeReact={createElement:(component,props)=>({component,props})};
const fakeStore={defineStore:(spec)=>({fakeStore:true,spec})};
const fakeRuntime={jsx:(component,props)=>({component,props}),jsxs:(component,props)=>({component,props})};
const req=(name)=>{
  if(name==='react')return fakeReact;
  if(name==='react/jsx-runtime')return fakeRuntime;
  if(name==='@deepseek-ai/dsh-client-store')return fakeStore;
  throw new Error('Unexpected unmocked platform dependency: '+name);
};
vm.runInNewContext(source,{window:{__ModuleLoader__:{load(item){exports=item.factory(req)}}},console,setTimeout,clearTimeout,TextEncoder,TextDecoder}, {timeout:18000});
assert.equal(typeof exports.apply,'function');
const services={
  '$mount':async()=>{},
};
const fakeCtx={
  remote:services,
  locale:{register(){},bind:()=>key=>key},
  effect(effect){if(typeof effect!=='function')throw Error('Invalid effect');},
  get(name){if(name!=='remote.mcpManager')throw Error('Unexpected service requested');return {list:async()=>({ok:true,servers:[]})}},
  slots:{inject(name,build){registered.push({name});build()},register(desc,render){registered.at(-1).descriptor=desc;registered.at(-1).render=render;}},
};
await exports.apply(fakeCtx);
assert.equal(registered.length,1);
const entry=registered[0];
assert.equal(entry.name,'plugins.bundle.config');
assert.equal(entry.descriptor.name,'plugins.bundle.config');
assert.equal(entry.descriptor.key,'dsh-mcp');
assert.equal(typeof entry.descriptor.store,'function');
assert.equal(typeof entry.descriptor.inject,'function');
assert.equal(typeof entry.render({view:'summary'}),'string');
const page=entry.render({view:'page',t:()=>'',useStore:()=>({}),actions:{}});
assert.equal(typeof page.component,'function');
assert.equal(typeof page.props.useStore,'function');
assert.equal(typeof page.props.actions,'object');
console.log(JSON.stringify({ok:true,imports,slot:entry.name,pluginKey:entry.descriptor.key,summary:true,detailComponent:page.component.name}));
