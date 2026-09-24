import { z } from 'zod';
import type { Plan } from './plan';
export const modelProviders=['qwen','zhipu'] as const;
export type ModelProvider=typeof modelProviders[number];
export const settingsSchema=z.object({language:z.enum(['zh','en']),region:z.string().min(1).max(60),origin:z.string().min(1).max(40),currency:z.enum(['CNY','USD','JPY']),scope:z.enum(['global','china']),effects:z.enum(['full','simple','off']),motion:z.enum(['on','reduced']),modelProvider:z.enum(modelProviders).default('qwen')});
export type Settings=z.infer<typeof settingsSchema>;
export const taskStatuses=['planning','sale','upcoming','ended'] as const;
export type TaskStatus=typeof taskStatuses[number];
export type ConversationMessage={role:'user'|'agent';text:string};
export type Task={id:string;plan:Plan;messages:ConversationMessage[];status:TaskStatus;updatedAt:string};
export type Notice={id:string;taskId:string;kind:'sale'|'price'|'event'|'stay'|'incomplete';read:boolean;createdAt:string};
const option=z.object({id:z.string(),title:z.string(),subtitle:z.string(),detail:z.string(),price:z.number().finite().nonnegative(),date:z.string().optional(),city:z.string().optional()});
const date=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s=>!Number.isNaN(Date.parse(s)));
export const planSchema=z.object({requirements:z.object({artist:z.string().min(1),origin:z.string().min(1),destination:z.string().min(1),budget:z.number().finite().positive(),weekend:z.boolean(),date:z.string().optional()}),selected:z.object({event:option.extend({date}),ticket:option,travel:option,hotel:option}),locked:z.object({event:z.boolean(),ticket:z.boolean(),travel:z.boolean(),hotel:z.boolean()}),revision:z.number().int().nonnegative()});
export const workspaceSchema=z.object({version:z.literal(2),revision:z.number().int().nonnegative(),settings:settingsSchema,tasks:z.array(z.object({id:z.string(),plan:planSchema,messages:z.array(z.object({role:z.enum(['user','agent']),text:z.string()})),status:z.enum(taskStatuses),updatedAt:z.string()})),notices:z.array(z.object({id:z.string(),taskId:z.string(),kind:z.enum(['sale','price','event','stay','incomplete']),read:z.boolean(),createdAt:z.string()}))});
export type Workspace={version:2;revision:number;settings:Settings;tasks:Task[];notices:Notice[]};
export function defaults(language='en'):Settings{return {language:language.toLowerCase().startsWith('zh')?'zh':'en',region:'中国大陆',origin:'上海',currency:'CNY',scope:'global',effects:'full',motion:'on',modelProvider:'qwen'};}
export function emptyWorkspace(language='en'):Workspace{return {version:2,revision:0,settings:defaults(language),tasks:[],notices:[]};}
export function upsertTask(tasks:Task[],task:Task){return tasks.some(t=>t.id===task.id)?tasks.map(t=>t.id===task.id?task:t):[task,...tasks];}
