'use client';
import {useEffect,useRef,useState} from 'react';
import {useWorkspace} from '../workspace/WorkspaceContext';

type City={name:string;lat:number;lng:number};

type BaiduPoint=object;
type BaiduMarker={addEventListener:(name:string,handler:()=>void)=>void};
type BaiduMap={centerAndZoom:(point:BaiduPoint,zoom:number)=>void;enableScrollWheelZoom:(enabled:boolean)=>void;setTilt?:(tilt:number)=>void;clearOverlays:()=>void;addOverlay:(overlay:BaiduMarker)=>void;panTo:(point:BaiduPoint)=>void;setZoom:(zoom:number)=>void};
type BaiduApi={Map:new(element:HTMLElement)=>BaiduMap;Point:new(lng:number,lat:number)=>BaiduPoint;Marker:new(point:BaiduPoint)=>BaiduMarker};
declare global{interface Window{BMapGL?:BaiduApi;__encoreBaiduMap?:Promise<BaiduApi>}}

async function loadSdk(){
 if(window.BMapGL)return window.BMapGL;
 if(window.__encoreBaiduMap)return window.__encoreBaiduMap;
 window.__encoreBaiduMap=fetch('/api/map-config').then(async response=>{
  const body=await response.json() as {configured?:boolean;ak?:string};
  if(!body.configured||!body.ak)throw new Error('not-configured');
  const ak=body.ak;
  return new Promise<BaiduApi>((resolve,reject)=>{
   const callback=`__encoreBaiduReady_${Date.now()}`;
   const timer=window.setTimeout(()=>{delete (window as unknown as Record<string,unknown>)[callback];reject(new Error('timeout'));},15000);
   (window as unknown as Record<string,unknown>)[callback]=()=>{window.clearTimeout(timer);delete (window as unknown as Record<string,unknown>)[callback];if(window.BMapGL)resolve(window.BMapGL);else reject(new Error('sdk-unavailable'));};
   const script=document.createElement('script');script.async=true;script.src=`https://api.map.baidu.com/api?v=1.0&type=webgl&ak=${encodeURIComponent(ak)}&callback=${callback}`;script.onerror=()=>{window.clearTimeout(timer);reject(new Error('load-failed'));};document.head.appendChild(script);
  });
 }).catch(error=>{window.__encoreBaiduMap=undefined;throw error;});
 return window.__encoreBaiduMap;
}

export default function BaiduConcertMap({cities,selected,onSelect,dataSource='demo'}:{cities:City[];selected:string;onSelect:(city:string)=>void;dataSource?:'demo'|'ticketmaster'}){
 const {settings,t}=useWorkspace();const host=useRef<HTMLDivElement>(null),map=useRef<BaiduMap|undefined>(undefined),[status,setStatus]=useState<'loading'|'ready'|'error'>('loading'),[retry,setRetry]=useState(0);
 useEffect(()=>{let active=true;queueMicrotask(()=>{if(active)setStatus('loading');});loadSdk().then(api=>{if(!active||!host.current)return;const instance=map.current??new api.Map(host.current);map.current=instance;instance.enableScrollWheelZoom(true);instance.clearOverlays();for(const city of cities){const point=new api.Point(city.lng,city.lat),marker=new api.Marker(point);marker.addEventListener('click',()=>onSelect(city.name));instance.addOverlay(marker);}const chosen=cities.find(city=>city.name===selected);if(chosen){instance.centerAndZoom(new api.Point(chosen.lng,chosen.lat),11);if(settings.effects==='full')instance.setTilt?.(42);}else instance.centerAndZoom(new api.Point(105,34),4);setStatus('ready');}).catch(()=>{if(active)setStatus('error');});return()=>{active=false;};},[cities,onSelect,retry,selected,settings.effects]);
 return <div className="baidu-map-shell"><div ref={host} className="baidu-map-canvas" aria-label={t('百度地图','Baidu map')}/>{status==='loading'&&<div className="map-state"><span className="breathing-dot"/>{t('地图加载中…','Loading map…')}</div>}{status==='error'&&<div className="map-state error-note"><span>{t('百度地图暂时无法加载','Baidu Maps could not load')}</span><button className="btn" onClick={()=>setRetry(value=>value+1)}>{t('重试')}</button></div>}<span className="baidu-credit">Baidu Maps · {dataSource==='ticketmaster'?'Ticketmaster':t('演出数据为演示','Demo concert data')}</span></div>;
}
