'use client';
import { useEffect,useState } from 'react';
import { useWorkspace, defaults } from '../workspace/WorkspaceContext';
import { Choice,Confirm } from '@/components/Controls';
import { cityData, mockUpdatedAt } from '@/providers/catalog';
import type { ModelProvider,Settings } from '@/domain/workspace';

type ProviderStatus=Record<ModelProvider,{configured:boolean;model:string}>;
const names:Record<ModelProvider,string>={qwen:'通义千问',zhipu:'智谱 GLM'};

export default function SettingsPage(){
 const {settings,saveSettings,t,feedback}=useWorkspace(),[confirm,setConfirm]=useState(false),[providers,setProviders]=useState<ProviderStatus>();
 const set=(key:keyof Settings,value:string)=>{if(saveSettings({...settings,[key]:value} as Settings))feedback(t('设置已保存','Settings saved'));};
 useEffect(()=>{fetch('/api/agent').then(r=>r.json() as Promise<{providers?:ProviderStatus}>).then(body=>setProviders(body.providers)).catch(()=>setProviders(undefined));},[]);
 return <section className="feature-page"><div className="eyebrow">YOUR PREFERENCES</div><h1>{t('设置')}</h1><p className="muted">{t('语言、所在地、出发城市与内容范围分别设置，互不改变。','Language, region, departure city and content scope are independent.')}</p>
 <div className="settings-grid">
  <Choice label={t('对话模型','AI model')} value={settings.modelProvider} onChange={v=>set('modelProvider',v)} options={(Object.keys(names) as ModelProvider[]).map(value=>({value,label:names[value]}))}/>
  <div className="field"><span>{t('模型配置状态','Model configuration')}</span><div className="provider-statuses">{(Object.keys(names) as ModelProvider[]).map(id=><span className={providers?.[id]?.configured?'is-ready':''} key={id}>{names[id]} · {providers?.[id]?.configured?t('已配置','Ready'):t('待配置','Not configured')}</span>)}</div><small>{t('密钥仅保存在本机服务端，不会发送到浏览器。','Keys stay on the local server and are never sent to the browser.')}</small></div>
  <Choice label={t('语言')} value={settings.language} onChange={v=>set('language',v)} options={[{value:'zh',label:'简体中文'},{value:'en',label:'English'}]}/>
  <label className="field"><span>{t('用户所在地')}</span><input value={settings.region} maxLength={60} onChange={e=>{if(e.target.value.trim())set('region',e.target.value);}}/></label>
  <Choice label={t('默认出发城市')} value={settings.origin} options={cityData.map(c=>({value:c.name,label:t(c.name,c.english)}))} onChange={v=>set('origin',v)}/>
  <Choice label={t('默认币种')} value={settings.currency} options={['CNY','USD','JPY'].map(v=>({value:v,label:v}))} onChange={v=>set('currency',v)}/>
  <Choice label={t('演出内容范围')} value={settings.scope} options={[{value:'global',label:t('全球')},{value:'china',label:t('中国大陆')}]} onChange={v=>set('scope',v)}/>
  <Choice label={t('3D效果')} value={settings.effects} options={[{value:'full',label:t('完整')},{value:'simple',label:t('简化')},{value:'off',label:t('关闭效果')}]} onChange={v=>set('effects',v)}/>
  <Choice label={t('动效')} value={settings.motion} options={[{value:'on',label:t('开启')},{value:'reduced',label:t('减少')}]} onChange={v=>set('motion',v)}/>
 </div>
 <p className="source-note">{t('估算换算：1 CNY = 0.14 USD = 20 JPY。底层预算始终以人民币保存。','Estimated conversion: 1 CNY = 0.14 USD = 20 JPY. Plans retain CNY as their base currency.')} · {mockUpdatedAt}</p>
 <button className="btn" onClick={()=>setConfirm(true)}>{t('恢复默认设置')}</button>{confirm&&<Confirm title={t('恢复默认设置')} description={t('恢复偏好设置，不删除已保存任务和提示。','Restore preferences without deleting your saved trips or updates.')} onClose={()=>setConfirm(false)} onConfirm={()=>{if(saveSettings(defaults(navigator.language)))feedback(t('设置已恢复','Settings restored'));setConfirm(false);}}/>}</section>;
}
