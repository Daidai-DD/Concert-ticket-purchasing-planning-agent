import {env} from 'cloudflare:workers';

export async function GET(){
 const ak=env.BAIDU_MAP_AK?.trim()??'';
 return Response.json({provider:'baidu',configured:!!ak,ak},{headers:{'Cache-Control':'no-store'}});
}
