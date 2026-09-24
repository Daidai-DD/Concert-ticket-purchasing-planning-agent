import type { Plan } from '../domain/plan';
import { agentReplySchema,type AgentRequest } from './agent-contract';
const errors:Record<string,[string,string]>={
  not_configured:['尚未配置所选模型的 API Key。请填写本地 .dev.vars 文件，重启服务后重试。','The selected model API key is not configured. Fill in .dev.vars and restart.'],
  authentication:['所选模型服务拒绝了密钥或模型权限，请检查对应平台。','The selected provider rejected the key or model permission.'],
  rate_limit:['所选模型服务目前繁忙、余额不足或达到限额，请稍后重试。','The selected provider is busy, out of balance, or rate limited. Try again later.'],
  model_request:['所选模型服务未接受当前模型配置，请检查模型 ID 与接口权限。','The selected provider rejected the model configuration.'],
  timeout:['模型响应超时。当前方案已保留，可以重试。','The model timed out. Your plan is unchanged; retry.'],
  connection:['暂时无法连接智谱，请检查网络后重试。','Unable to connect to Zhipu. Check the network and retry.'],
  invalid_response:['模型返回的方案格式不完整，未修改当前方案，请重试。','The model returned an invalid plan. No changes were applied. Retry.'],
  invalid_request:['对话或方案格式无效，请新建规划后重试。','The conversation or plan format is invalid. Start a new plan.'],
  upstream:['所选模型服务暂时不可用。当前方案已保留，请稍后重试。','The selected model provider is unavailable. Your plan is unchanged.'],
};
export async function replyWithRemoteAgent(input:Omit<AgentRequest,'plan'> & {plan?:Plan}){
  let response:Response;
  try{response=await fetch('/api/agent',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input),signal:AbortSignal.timeout(55000)});}catch{throw new Error(errors.connection[input.language==='en'?1:0]);}
  const body=await response.json().catch(()=>({code:'upstream'}));
  if(!response.ok)throw new Error((errors[typeof body==='object'&&body!==null&&'code' in body?String(body.code):'upstream']??errors.upstream)[input.language==='en'?1:0]);
  const result=agentReplySchema.safeParse(body);
  if(!result.success)throw new Error(errors.invalid_response[input.language==='en'?1:0]);
  return result.data;
}
