import {env} from 'cloudflare:workers';
import {searchTicketmasterEvents,TicketmasterError} from '@/services/ticketmaster';

const noCache={'Cache-Control':'no-store'};

export async function GET(request:Request){
 const apiKey=env.TICKETMASTER_API_KEY?.trim()??'';
 if(!apiKey)return Response.json({configured:false,events:[]},{headers:noCache});
 const input=new URL(request.url).searchParams;
 const keyword=(input.get('keyword')??'').trim().slice(0,80);
 const city=(input.get('city')??'').trim().slice(0,80);
 try{
  const events=await searchTicketmasterEvents(apiKey,{keyword:keyword||undefined,city:city||undefined});
  return Response.json({configured:true,source:'ticketmaster',updatedAt:new Date().toISOString(),events},{headers:noCache});
 }catch(error){
  const status=error instanceof TicketmasterError&&error.status===401?401:502;
  return Response.json({configured:true,code:status===401?'authentication':'upstream',events:[]},{status,headers:noCache});
 }
}
