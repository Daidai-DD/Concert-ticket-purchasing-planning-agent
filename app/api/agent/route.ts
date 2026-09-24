import { env } from 'cloudflare:workers';
import { agentRequestSchema } from '@/services/agent-contract';
import { replyWithModel,AgentError,providerDefaults } from '@/services/zhipu';
import type { ModelProvider } from '@/domain/workspace';

const noCache={'Cache-Control':'no-store'};
function qwenEndpoint(value:string){
  const raw=value.trim()||'https://dashscope.aliyuncs.com/compatible-mode/v1';
  let url:URL;try{url=new URL(raw);}catch{throw new AgentError('model_request',500);}
  if(url.protocol!=='https:'||!(url.hostname==='dashscope.aliyuncs.com'||url.hostname.endsWith('.maas.aliyuncs.com')))throw new AgentError('model_request',500);
  url.pathname=url.pathname.replace(/\/$/,'')+(url.pathname.endsWith('/chat/completions')?'':'/chat/completions');
  return url.toString();
}
function configs(){return {
  qwen:{provider:'qwen',apiKey:env.QWEN_API_KEY?.trim()??'',model:env.QWEN_MODEL?.trim()||providerDefaults.qwen.model,endpoint:qwenEndpoint(env.QWEN_BASE_URL??'')},
  zhipu:{provider:'zhipu',apiKey:env.ZHIPU_API_KEY?.trim()??'',model:env.ZHIPU_MODEL?.trim()||providerDefaults.zhipu.model,endpoint:providerDefaults.zhipu.endpoint},
} satisfies Record<ModelProvider,{provider:ModelProvider;apiKey:string;model:string;endpoint:string}>;}
export async function GET(){const all=configs();return Response.json({providers:Object.fromEntries(Object.entries(all).map(([id,c])=>[id,{model:c.model,configured:!!c.apiKey}]))},{headers:noCache});}
let inFlight=false;
let lastStarted=0;
export async function POST(request:Request){
  const origin=request.headers.get('origin');
  if(origin&&origin!==new URL(request.url).origin)return Response.json({code:'origin'}, {status:403,headers:noCache});
  if(!request.headers.get('content-type')?.includes('application/json'))return Response.json({code:'invalid_request'},{status:415,headers:noCache});
  if(inFlight||Date.now()-lastStarted<1500)return Response.json({code:'rate_limit'},{status:429,headers:noCache});
  let body:unknown;
  try{const text=await request.text();if(text.length>100000)return Response.json({code:'too_large'},{status:413,headers:noCache});body=JSON.parse(text);}catch{return Response.json({code:'invalid_request'},{status:400,headers:noCache});}
  const parsed=agentRequestSchema.safeParse(body);if(!parsed.success)return Response.json({code:'invalid_request'},{status:400,headers:noCache});
  const c=configs()[parsed.data.provider];if(!c.apiKey)return Response.json({code:'not_configured',provider:c.provider},{status:503,headers:noCache});
  inFlight=true;lastStarted=Date.now();
  try{return Response.json(await replyWithModel(parsed.data,c),{headers:noCache});}
  catch(error){return Response.json({code:error instanceof AgentError?error.code:'upstream'},{status:error instanceof AgentError?error.status:502,headers:noCache});}
  finally{inFlight=false;}
}
