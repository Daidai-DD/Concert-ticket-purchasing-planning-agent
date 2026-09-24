import type { Plan } from '../domain/plan';
import type { MapProvider, RouteProvider, MapPlace, MockRoute, RouteMode } from './contracts';
import { cityData } from './catalog';
export const mockMapProvider:MapProvider={async loadCities(){return cityData;},async places(plan){const c=cityData.find(c=>c.name===plan.requirements.destination)??cityData[0];const h=Number(plan.selected.hotel.id.split('-')[1])||0;return [{id:'arrival',name:plan.selected.travel.subtitle.includes('高铁')?'城市车站 / Station':'城市机场 / Airport',kind:'arrival',lat:c.lat+.1,lng:c.lng-.13},{id:'hotel',name:plan.selected.hotel.title,kind:'hotel',lat:c.lat+.01*(h+1),lng:c.lng-.025*(h+1)},{id:'venue',name:plan.selected.event.subtitle,kind:'venue',lat:c.lat,lng:c.lng}];}};
export const mockRouteProvider:RouteProvider={async query(places,mode,fail=false){await new Promise(r=>setTimeout(r,180));if(fail)throw new Error('route-unavailable');const pairs=[[0,1],[1,2],[2,1],[1,0]];return pairs.map(([a,b],i)=>{const from=places[a],to=places[b];const distance=Math.max(0.5,Math.round(Math.hypot(from.lat-to.lat,from.lng-to.lng)*1000)/10);const speed={walk:4.5,transit:25,drive:35}[mode];return {id:`${mode}-${i}`,from,to,mode,distance,minutes:Math.ceil(distance/speed*60)+(mode==='transit'?10:0),steps:mode==='transit'?['步行至演示站点 / Walk to demo station','乘坐 Mock A 线 → 换乘 Mock B 线 / Transfer A → B','出站步行至目的地 / Walk to destination']:mode==='walk'?['沿演示步行路线前往终点 / Follow the illustrative walking route']:['沿演示道路行驶至终点 / Follow the illustrative driving route'],polyline:[from,{lat:(from.lat+to.lat)/2+.005,lng:from.lng},to],quality:'demo',label:['抵达 / Arrival','观演 / To show','散场 / After show','返程 / Return'][i]};});}};
// No API key, SDK loading, network request or fabricated Google result in V0.2.
// Production adapters should use Maps JS maps3d, Places and server-backed Routes.
export class GoogleMapProvider implements MapProvider{
 async loadCities():Promise<typeof cityData>{throw new Error('google-not-configured');}
 async places(_plan:Plan):Promise<MapPlace[]>{throw new Error('google-not-configured');}
 async focus(_place:MapPlace):Promise<void>{throw new Error('google-not-configured');}
}
export class GoogleRouteProvider implements RouteProvider{async query(_places:MapPlace[],_mode:RouteMode):Promise<MockRoute[]>{throw new Error('google-not-configured');}}