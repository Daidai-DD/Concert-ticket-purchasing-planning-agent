import type { Requirements } from '../domain/plan';
import type { PlanningProvider, Catalog } from './contracts';
function createMock(mainland:boolean):PlanningProvider {
 return {
 metadata:{source:mainland?'China Mock Provider':'Global Mock Provider',updatedAt:'2026-09-20',quality:'demo',originalCurrency:'CNY',displayCurrency:'CNY'},
 events:r=>['2026-10-17','2026-10-24','2026-10-31'].map((date,i)=>({id:`event-${i}`,title:r.artist,subtitle:`${r.destination} · ${mainland?'城市音乐中心':'湾岸音乐馆'}（演示场馆）`,detail:`${date} 周六 · 19:00\n开售：2026-09-28 12:00（演示）`,price:0,date,city:r.destination})),
 tickets:()=>[{id:'ticket-0',title:'A 区看台',subtitle:'首选 · 视野与预算的平衡',detail:'正对舞台，距离约 60 米\n固定座席，无遮挡区域（演示）',price:1280},{id:'ticket-1',title:'内场前区',subtitle:'升级 · 更靠近现场',detail:'距舞台约 20 米，站立区域\n平地视线受前排观众影响（演示）',price:2180},{id:'ticket-2',title:'B 区看台',subtitle:'经济 · 留更多预算给旅程',detail:'侧方高层看台，距离约 90 米\n可看舞台全景，细节依赖大屏（演示）',price:780}],
 routes:r=>[{id:'travel-0',title:`${r.origin} ⇄ ${r.destination}`,subtitle:mainland?'往返高铁 + 场馆交通':'往返直飞 + 场馆交通',detail:'去程 09:00 → 13:00 · 演出当天\n返程 16:00 → 18:30 · 次日\n含市内交通 ¥200；散场后地铁出行',price:mainland?1100:2480},{id:'travel-1',title:`${r.origin} ⇄ ${r.destination}`,subtitle:'早班经济路线',detail:'去程 06:30 → 10:30 · 演出当天\n返程 20:00 → 22:30 · 次日\n含市内交通 ¥200；散场预留 45 分钟',price:mainland?800:1880},{id:'travel-2',title:`${r.origin} ⇄ ${r.destination}`,subtitle:'灵活时段路线',detail:'去程 08:00 → 12:00 · 演出当天\n返程 17:00 → 19:30 · 次日\n含市内交通 ¥300；可选较宽松返程',price:mainland?1600:3180}],
 hotels:()=>[{id:'hotel-0',title:'STAY 湾岸',subtitle:'场馆周边 · 舒适双人间',detail:'距场馆 1.2 公里 · 步行约 16 分钟\n1 人入住 / 1 间 / 1 晚',price:860},{id:'hotel-1',title:'NEST 城市旅舍',subtitle:'市区 · 经济单人间',detail:'距场馆 5 公里 · 地铁约 25 分钟\n1 人入住 / 1 间 / 1 晚',price:480},{id:'hotel-2',title:'SLOW 河畔酒店',subtitle:'场馆周边 · 高层景观间',detail:'距场馆 800 米 · 步行约 10 分钟\n1 人入住 / 1 间 / 1 晚',price:1280}]
 };
}
export const chinaMockProvider=createMock(true);
export const globalMockProvider=createMock(false);
export function providerFor(destination:string){return ['北京','上海','广州','深圳','杭州'].includes(destination)?chinaMockProvider:globalMockProvider;}
export function catalogFor(r:Required<Requirements>):Catalog{const p=providerFor(r.destination);return {event:p.events(r),ticket:p.tickets(r),travel:p.routes(r),hotel:p.hotels(r)};}