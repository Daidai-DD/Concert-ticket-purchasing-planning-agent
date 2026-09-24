import { changeOption, optimize, kinds, total, type Plan, type Requirements } from '../domain/plan';
import { catalogFor } from '../providers/mock';
import { artists, cityData, money } from '../providers/catalog';
import type { AgentDecision, AgentRequest } from './agent-contract';
import type { AgentReply } from './agent';

// Only trusted providers supply prices, venues and IDs. The model proposes intent.
export function applyDecision(input:AgentRequest, decision:AgentDecision):AgentReply {
  const en=input.language==='en';
  const say=(zh:string,english:string)=>en?english:zh;
  const previous=input.plan;
  const r:Requirements={...input.requirements,...decision.requirements};
  const unchanged=(message:string):AgentReply=>({message,requirements:previous?.requirements??input.requirements,plan:previous});
  const complete=!!(r.artist&&r.origin&&r.destination&&r.budget);
  // A complete first request is sufficient to create a usable default plan.
  // Optional date, ticket and hotel preferences can be adjusted afterwards.
  if(decision.intent==='reply'&&(previous||!complete))return {message:decision.message,requirements:previous?.requirements??r,plan:previous};
  if(!r.artist||!r.origin||!r.destination||!r.budget)return {message:say('还需要补充艺人、出发城市、目的地和总预算中的缺失信息，才能生成方案。','Please provide the missing artist, departure city, destination and total budget.'),requirements:previous?.requirements??r,plan:previous};
  if(!artists.includes(r.artist)||![r.origin,r.destination].every(c=>cityData.some(city=>city.name===c))||r.origin===r.destination){
    return {message:say('我可以继续讨论你的观演需求，但目前没有这位艺人或这条路线的真实场次和报价，不能生成可预订方案。要测试卡片流程，可以选择演示艺人 ASTER、LUNA PARK、THE ECHOES 和演示城市。','We can discuss your trip, but verified shows and prices for this artist or route are not connected. I cannot create a bookable plan. Use ASTER, LUNA PARK or THE ECHOES with supported cities to test demo planning.'),requirements:previous?.requirements??r,plan:previous};
  }
  const ready={...r,weekend:r.weekend??true} as Required<Requirements>;
  const changed=previous&&(ready.artist!==previous.requirements.artist||ready.origin!==previous.requirements.origin||ready.destination!==previous.requirements.destination);
  if(changed&&kinds.some(k=>previous.locked[k]))return unchanged(say('更换艺人或城市会影响整个方案，请先解锁卡片。当前方案没有改变。','Unlock all cards before changing the artist or cities. Your plan is unchanged.'));
  const catalog=catalogFor(ready);
  const ids={...decision.selections};
  const date=decision.date??(!previous?input.preferredDate:undefined);
  if(ready.weekend===false&&!previous)return {message:say('目前目录只有周六的演示场次，没有工作日场次可供生成。','The current catalog only has Saturday demo shows, not weekday shows.'),requirements:r};
  if(date){const event=catalog.event.find(e=>e.date===date);if(!event)return {message:say('目录没有这个日期的场次。现有演示日期为 2026-10-17、2026-10-24、2026-10-31。','No show is available on that date. Demo dates: 2026-10-17, 2026-10-24, 2026-10-31.'),requirements:previous?.requirements??r,plan:previous};ids.event=event.id;}
  // Reject the whole proposal before mutating anything if an ID is invented.
  for(const k of kinds)if(ids[k]&&!catalog[k].some(o=>o.id===ids[k]))return unchanged(say('模型返回了目录中不存在的选项，当前方案未修改。请重试或用卡片调整。','The model selected an unavailable option. No changes were applied. Retry or use the card controls.'));
  let next:Plan=previous&&!changed?{...previous,requirements:ready}:{requirements:ready,selected:{event:catalog.event[0],ticket:catalog.ticket[0],travel:catalog.travel[0],hotel:catalog.hotel[0]},locked:{event:false,ticket:false,travel:false,hotel:false},revision:1};
  const notes:string[]=[];
  for(const k of kinds){
    const option=catalog[k].find(o=>o.id===ids[k]);
    if(!option||next.selected[k].id===option.id)continue;
    if(next.locked[k]){notes.push(say('已保留锁定项目。','Locked items were preserved.'));continue;}
    try{next=changeOption(next,k,option);}catch{notes.push(say('场次变更与已锁定行程或酒店冲突，保留原场次。','The show change conflicts with locked travel or hotel dates. The original show was kept.'));}
  }
  if(decision.optimize||(!previous&&total(next)>ready.budget))next=optimize(next,catalog);
  const cost=money(total(next),input.currency,input.language);
  const over=total(next)>ready.budget?say(' 超出预算，可继续调整。',' This exceeds your budget.'):'';
  // System-calculated confirmation avoids repeating a model claim about rejected changes.
  return {requirements:next.requirements,plan:next,message:say(`演示方案${previous?'已更新':'已生成'}：${next.requirements.origin} → ${next.requirements.destination}，${next.selected.event.date}，合计 ${cost}。${[...new Set(notes)].join('')}${over}\n场次与价格来自模拟目录，不能用于实际预订。`,`Demo plan ${previous?'updated':'created'}: ${next.requirements.origin} → ${next.requirements.destination}, ${next.selected.event.date}, total ${cost}. ${[...new Set(notes)].join('')}${over}\nShows and prices are simulated and cannot be booked.`)};
}
