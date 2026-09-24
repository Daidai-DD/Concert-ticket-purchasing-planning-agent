'use client';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { defaults, emptyWorkspace, type Workspace, type Settings, type Task, type Notice } from '@/domain/workspace';
import { readWorkspace, STORAGE_KEY, writeWorkspace } from '@/storage/workspace';
import { money } from '@/providers/catalog';
import { translations } from '@/i18n/core';
type ContextValue={data:Workspace;ready:boolean;online:boolean;storageError:string;notice:string;t:(zh:string,en?:string)=>string;cash:(value:number)=>string;commit:(update:(data:Workspace)=>Workspace)=>boolean;reload:()=>void;reset:()=>void;feedback:(text:string)=>void;settings:Settings;saveSettings:(s:Settings)=>boolean;tasks:Task[];notices:Notice[]};
const Context=createContext<ContextValue|null>(null);
export function WorkspaceProvider({children}:{children:ReactNode}){
 const [data,setData]=useState<Workspace>(()=>emptyWorkspace()),[ready,setReady]=useState(false),[online,setOnline]=useState(true),[storageError,setStorageError]=useState(''),[notice,setNotice]=useState('');const current=useRef(data),blocked=useRef(false);
 const reload=useCallback(()=>{try{const next=readWorkspace(localStorage,navigator.language);current.current=next;setData(next);setStorageError('');blocked.current=false;}catch{blocked.current=true;setStorageError('read');}setReady(true);},[]);
 useEffect(()=>{const net=()=>setOnline(navigator.onLine);queueMicrotask(()=>{reload();net();});const storage=(e:StorageEvent)=>{if(e.key===STORAGE_KEY)reload();};window.addEventListener('online',net);window.addEventListener('offline',net);window.addEventListener('storage',storage);return()=>{window.removeEventListener('online',net);window.removeEventListener('offline',net);window.removeEventListener('storage',storage);};},[reload]);
 useEffect(()=>{document.documentElement.lang=data.settings.language==='zh'?'zh-CN':'en';document.documentElement.dataset.motion=data.settings.motion;},[data.settings]);
 function commit(update:(data:Workspace)=>Workspace){if(!ready||blocked.current){setStorageError('read');return false;}try{const next=writeWorkspace(localStorage,update(current.current),current.current.revision);current.current=next;setData(next);setStorageError('');return true;}catch(e){setStorageError(e instanceof Error&&e.message==='storage-conflict'?'conflict':'write');return false;}}
 function reset(){try{const next=emptyWorkspace(navigator.language);localStorage.setItem(STORAGE_KEY,JSON.stringify(next));blocked.current=false;current.current=next;setData(next);setStorageError('');setNotice(next.settings.language==='zh'?'本地数据已重置':'Local data reset');}catch{setStorageError('write');}}
 const t=(zh:string,en?:string)=>data.settings.language==='zh'?zh:en??translations[zh]??zh;
 return <Context.Provider value={{data,ready,online,storageError,notice,t,cash:v=>money(v,data.settings.currency,data.settings.language),commit,reload,reset,feedback:setNotice,settings:data.settings,saveSettings:s=>commit(d=>({...d,settings:s})),tasks:data.tasks,notices:data.notices}}>{children}</Context.Provider>;
}
export function useWorkspace(){const c=useContext(Context);if(!c)throw new Error('Workspace provider missing');return c;}
export {defaults};
