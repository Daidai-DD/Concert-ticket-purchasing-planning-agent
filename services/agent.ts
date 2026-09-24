import { changeOption, optimize, total, kinds, type Plan, type Requirements } from '../domain/plan';
import { catalogFor } from '../providers/mock';
export interface AgentService { reply(text:string, requirements:Requirements, plan?:Plan):Promise<AgentReply> }
export type AgentReply={message:string;requirements:Requirements;plan?:Plan};
const cities=['上海','东京','大阪','北京','广州','深圳','杭州','首尔','新加坡'];
export function parse(text:string,previous:Requirements):Requirements {
 const r={...previous};
 const origin=text.match(/从([\u4e00-\u9fa5]{2,6}?)(?:去|到|出发|前往)/);if(origin) r.origin=origin[1];
 const dest=text.match(/(?:去|到|前往)([\u4e00-\u9fa5]{2,6}?)(?:看|听|，|,|\s|$)/);if(dest)r.destination=dest[1];
 for(const city of cities){if(text===city) {if(!r.origin)r.origin=city;else r.destination=city;}}
 const budget=text.replace(/[,，](?=\d{3}(?:\D|$))/g,'').match(/(?:预算|上限|控制在|不超过|总共)[^\d]{0,5}(\d+(?:\.\d+)?)(千|万|k)?/i) || text.match(/(\d+(?:\.\d+)?)(千|万|k)?\s*(?:元|块)/i) || text.match(/^\s*(\d+(?:\.\d+)?)(千|万|k)?\s*$/i);
 if(budget)r.budget=Number(budget[1])*(budget[2]==='万'?10000:budget[2] ?1000:1);
 if(/(?:预算|上限)[^\d]{0,5}-\s*\d/.test(text))r.budget=-1;
 if(/周末|周六|周日/.test(text))r.weekend=true;
 const known=['ASTER','LUNA PARK','THE ECHOES'].find(a=>text.toUpperCase().includes(a));
 if(known)r.artist=known;
 else {const artist=text.match(/看\s*([^，。！？,!?]{1,30}?)(?:的演唱会|的演出|演唱会|，|,|$)/)?.[1]?.trim(); if(artist&&!/某|歌手|一场|场演唱会|现场/.test(artist))r.artist=artist;}
 if(!r.artist && previous.origin && previous.destination && /^[\p{L} .·-]{2,30}$/u.test(text.trim()) && !cities.includes(text.trim()) && !/预算|周末|随便|都行|不知道/.test(text))r.artist=text.trim();
 return r;
}
export const mockAgent:AgentService={async reply(text,previous,plan){
 const r=parse(text,previous);
 if(!r.artist)return {requirements:r,message:'想看哪位艺人？可以输入艺人名称，或试试演示艺人 ASTER、LUNA PARK、THE ECHOES。'};
 if(!r.origin)return {requirements:r,message:'你准备从哪座城市出发？例如：上海。'};
 if(!r.destination)return {requirements:r,message:'想去哪座城市看演出？例如：东京。'};
 if(!r.budget||r.budget<1||r.budget>1000000)return {requirements:{...r,budget:undefined},message:'请告诉我有效的人民币总预算，例如“预算6000元”（1–1,000,000 元）。'};
 if(!cities.includes(r.destination)||!cities.includes(r.origin))return {requirements:r,message:'目前演示数据支持上海、东京、大阪、北京、广州、深圳、杭州、首尔和新加坡。请补充“从上海去东京”等支持的路线。'};
 if(r.origin===r.destination)return {requirements:r,message:'当前演示链路用于跨城观演，请选择不同的出发地和目的地。'};
 const requestedDate=text.match(/\d{4}-\d{2}-\d{2}/)?.[0];
 if(/周一|周二|周三|周四|周五/.test(text)||(requestedDate&&!['2026-10-17','2026-10-24','2026-10-31'].includes(requestedDate)))return {requirements:r,message:'当前 Mock 场次仅提供 2026 年 10 月 17、24、31 日三个周六。请通过场次卡片选择可用日期。'};
 const ready={...r,weekend:r.weekend??true} as Required<Requirements>;const catalog=catalogFor(ready);
 if(!plan){const next:Plan={requirements:ready,selected:{event:catalog.event.find(e=>e.date===requestedDate)??catalog.event[0],ticket:catalog.ticket[0],travel:catalog.travel[0],hotel:catalog.hotel[0]},locked:{event:false,ticket:false,travel:false,hotel:false},revision:1};const fit=total(next)>ready.budget?optimize(next,catalog):next;return {requirements:ready,plan:fit,message:`已为你安排 ${ready.artist} 的周末观演旅程：${ready.origin} → ${ready.destination}，1 人、2 天 1 晚。\n四项方案已生成，可逐项替换或锁定。总预算仅含票、往返交通及酒店，不含餐饮、签证与购物。`};}
 const routeChanged=ready.origin!==plan.requirements.origin||ready.destination!==plan.requirements.destination||ready.artist!==plan.requirements.artist;
 if(routeChanged&&kinds.some(k=>plan.locked[k]))return {requirements:plan.requirements,plan,message:'修改艺人或城市需要重新匹配整个方案。请先解锁所有卡片，再修改需求。'};
 if(routeChanged)return this.reply(text,ready);
 let next={...plan,requirements:ready};let acted=r.budget!==plan.requirements.budget;const notes:string[]=[];
 const apply=(kind:'ticket'|'hotel'|'travel'|'event',index:number)=>{acted=true;if(next.locked[kind]){notes.push({ticket:'票档',hotel:'酒店',travel:'行程',event:'场次'}[kind]+'已锁定，保持不变');return;}try{next=changeOption(next,kind,catalog[kind][index]);}catch(e){notes.push((e as Error).message);}};
 if(requestedDate)apply('event',catalog.event.findIndex(e=>e.date===requestedDate));
 if(/票.*(?:贵|好|升级|靠近)/.test(text))apply('ticket',1);
 if(/票.*(?:便宜|降|省)/.test(text)&&!/票.*贵/.test(text))apply('ticket',2);
 if(/酒店.*(?:便宜|省|降)/.test(text))apply('hotel',1);
 if(/酒店.*(?:好|近|升级)/.test(text))apply('hotel',2);
 if(/行程.*(?:便宜|省)|早班/.test(text))apply('travel',1);
 if(/换.*场|下周/.test(text))apply('event',(catalog.event.findIndex(o=>o.id===next.selected.event.id)+1)%catalog.event.length);
 if(/重新规划|省钱|整体便宜/.test(text)){next=optimize(next,catalog);acted=true;}
 if(!acted)return {requirements:ready,plan,message:'可以说“票可以买贵一点，酒店便宜一点”“预算改为5000元”或“重新规划”。日期、路线和酒店区域也可以通过卡片的“调整”选择。'};
 return {requirements:ready,plan:next,message:`方案已更新。${notes.length?notes.join('；')+'。':''}${total(next)>ready.budget?`当前超出预算 ¥${total(next)-ready.budget}，可以点击重新规划。`:'费用已同步，锁定内容保持不变。'}`};
}};
