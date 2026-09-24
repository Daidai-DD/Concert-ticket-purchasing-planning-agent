export type Kind = 'event' | 'ticket' | 'travel' | 'hotel';
export const kinds: Kind[] = ['event','ticket','travel','hotel'];
export type Requirements = { artist?: string; origin?: string; destination?: string; budget?: number; weekend?: boolean };
export type Option = { id: string; title: string; subtitle: string; detail: string; price: number; date?: string; city?: string };
export type Plan = { requirements: Required<Requirements>; selected: Record<Kind, Option>; locked: Record<Kind, boolean>; revision: number };
export function total(plan: Plan){ return kinds.reduce((sum,k)=>sum+plan.selected[k].price,0); }
export function stayDates(date: string){const next=new Date(date+'T12:00:00Z');next.setUTCDate(next.getUTCDate()+1);return `${date} → ${next.toISOString().slice(0,10)}`;}
export function changeOption(plan: Plan, kind: Kind, option: Option): Plan {
 if(plan.locked[kind]) throw new Error('这张卡片已锁定，请先解锁后再调整。');
 if(kind==='event' && option.id!==plan.selected.event.id && (plan.locked.travel||plan.locked.hotel)) throw new Error('更换场次需要同步行程和入住日期。请先解锁行程和酒店。');
 return {...plan,selected:{...plan.selected,[kind]:option},revision:plan.revision+1};
}
export function toggleLock(plan:Plan, kind:Kind):Plan{return {...plan,locked:{...plan.locked,[kind]:!plan.locked[kind]}};}
export function optimize(plan:Plan, catalog: Record<Kind,Option[]>):Plan {
 let next=plan;
 for(const kind of ['hotel','travel','ticket'] as Kind[]){if(!next.locked[kind]) next=changeOption(next,kind,[...catalog[kind]].sort((a,b)=>a.price-b.price)[0]);}
 return next;
}