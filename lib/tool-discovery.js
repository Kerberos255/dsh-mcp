/** MCP discovery, independent of Host APIs; designed for unit testing. */
const aliases=[
 [/导航|路线|路径|怎么走/u,['direction','route','driving','walking','transit']],
 [/开车|驾车|自驾/u,['driving','direction','route']],
 [/步行|走路/u,['walking','direction']],
 [/公交|地铁|公共交通/u,['transit','bus','direction']],
 [/骑行|骑车/u,['bicycling','cycling','direction']],
 [/周边|附近|周围/u,['around','nearby','place','search']],
 [/地点|商家|景点|餐厅|酒店/u,['place','poi','search']],
 [/地图/u,['maps','map']],
 [/地址|经纬度|坐标/u,['geocode','location','address']],
 [/定位|我在哪|当前位置/u,['location','ip_location']],
 [/天气|气温|下雨/u,['weather']],
 [/搜索|查找|查询|找一找/u,['search']],
 [/距离|多远/u,['distance','route']]
];
export function searchTokens(query){
 if(typeof query!=='string')return [];
 const normalized=query.normalize('NFKC').toLowerCase().slice(0,200);
 const result=new Set();
 for(const match of normalized.matchAll(/[\p{Script=Han}]+|[\p{Letter}\p{Number}_-]+/gu)){
  const word=match[0];
  if(!/\p{Script=Han}/u.test(word)){result.add(word);continue;}
  if(word.length<=12)result.add(word);
  // Chinese can lack spaces: searchable 2/3/4-char fragments also match descriptions.
  for(let len=2;len<=Math.min(4,word.length);len++)
   for(let i=0;i+len<=word.length;i++)result.add(word.slice(i,i+len));
 }
 for(const [pattern,terms] of aliases)if(pattern.test(normalized))for(const term of terms)result.add(term);
 return [...result].filter(Boolean).slice(0,96);
}
export function scoreTool(tokens,name,description=''){
 const n=String(name).toLowerCase(),d=String(description).toLowerCase();
 const server=n.slice(5).split('__')[0]??'';
 let score=0;
 for(const term of tokens){
  if(n.includes(term))score+=3;
  else if(server.includes(term))score+=2;
  else if(d.includes(term))score+=1;
 }
 return score;
}
export function rankMcpTools(query,pool,limit=8){
 const tokens=searchTokens(query);
 if(!tokens.length)return [];
 return pool.map(tool=>({tool,score:scoreTool(tokens,tool.name,tool.description)}))
  .filter(row=>row.score>0).sort((a,b)=>b.score-a.score||String(a.tool.name).localeCompare(String(b.tool.name)))
  .slice(0,Math.min(8,Math.max(1,Number.isSafeInteger(limit)?limit:8))).map(row=>row.tool);
}
/** Model-visible MCP tools are session-local, with a cap on sessions and tools. */
export class ScopedToolHotset{
 constructor({sessionLimit=48,toolsPerSession=8}={}){
  this.sessionLimit=sessionLimit;
  this.toolsPerSession=toolsPerSession;
  this.sessions=new Map();
 }
 touch(sessionId,name){
  if(typeof sessionId!=='string'||!sessionId||sessionId.length>200||typeof name!=='string'||!name.startsWith('mcp__'))return false;
  let row=this.sessions.get(sessionId)??new Map();
  this.sessions.delete(sessionId);
  row.delete(name);
  row.set(name,true);
  while(row.size>this.toolsPerSession)row.delete(row.keys().next().value);
  this.sessions.set(sessionId,row);
  while(this.sessions.size>this.sessionLimit)this.sessions.delete(this.sessions.keys().next().value);
  return true;
 }
 names(sessionId){return [...(this.sessions.get(sessionId)?.keys()??[])];}
 deleteTool(name){for(const row of this.sessions.values())row.delete(name);}
 clear(){this.sessions.clear();}
 get size(){let count=0;for(const row of this.sessions.values())count+=row.size;return count;}
 get sessionCount(){return this.sessions.size;}
}
