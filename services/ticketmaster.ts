import type {Concert} from '@/providers/catalog';

const endpoint='https://app.ticketmaster.com/discovery/v2/events.json';

type TicketmasterEvent={
 id?:string;
 name?:string;
 url?:string;
 dates?:{start?:{localDate?:string}};
 _embedded?:{venues?:Array<{name?:string;city?:{name?:string};country?:{countryCode?:string};location?:{latitude?:string;longitude?:string}}>};
};

type TicketmasterResponse={_embedded?:{events?:TicketmasterEvent[]}};

export class TicketmasterError extends Error{constructor(public status:number){super('ticketmaster');}}

export async function searchTicketmasterEvents(apiKey:string,filters:{keyword?:string;city?:string},fetcher:typeof fetch=fetch):Promise<Concert[]>{
 const url=new URL(endpoint);
 url.searchParams.set('apikey',apiKey);
 url.searchParams.set('classificationName','music');
 url.searchParams.set('size','40');
 url.searchParams.set('sort','date,asc');
 url.searchParams.set('startDateTime',new Date().toISOString().replace(/\.\d{3}Z$/,'Z'));
 if(filters.keyword)url.searchParams.set('keyword',filters.keyword);
 if(filters.city)url.searchParams.set('city',filters.city);
 const response=await fetcher(url,{headers:{Accept:'application/json'}});
 if(!response.ok)throw new TicketmasterError(response.status);
 const body=await response.json() as TicketmasterResponse;
 return (body._embedded?.events??[]).flatMap((event):Concert[]=>{
  const venue=event._embedded?.venues?.[0],date=event.dates?.start?.localDate,city=venue?.city?.name;
  if(!event.id||!event.name||!date||!city)return [];
  const lat=Number(venue?.location?.latitude),lng=Number(venue?.location?.longitude);
  return [{id:`ticketmaster-${event.id}`,eventId:event.id,artist:event.name,city,date,venue:venue?.name??city,region:venue?.country?.countryCode==='CN'?'china':'international',source:'ticketmaster',url:event.url,...(Number.isFinite(lat)&&Number.isFinite(lng)?{lat,lng}:{})}];
 });
}
