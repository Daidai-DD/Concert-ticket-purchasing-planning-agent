import { z } from 'zod';
import { modelProviders, planSchema } from '../domain/workspace';

export const requirementsSchema = z.object({
  artist: z.string().trim().min(1).max(80).optional(),
  origin: z.string().trim().min(1).max(80).optional(),
  destination: z.string().trim().min(1).max(80).optional(),
  budget: z.number().finite().positive().max(1000000).optional(),
  weekend: z.boolean().optional(),
});
export const agentRequestSchema = z.object({
  text: z.string().trim().min(1).max(6000),
  requirements: requirementsSchema,
  plan: planSchema.optional(),
  history: z.array(z.object({role:z.enum(['user','agent']),text:z.string().max(8000)})).max(24).default([]),
  language: z.enum(['zh','en']).default('zh'),
  currency: z.enum(['CNY','USD','JPY']).default('CNY'),
  preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  provider: z.enum(modelProviders).default('zhipu'),
});
export type AgentRequest = z.infer<typeof agentRequestSchema>;
export const decisionSchema = z.object({
  message: z.string().trim().min(1).max(6000),
  intent: z.enum(['reply','generate','adjust']),
  requirements: requirementsSchema.default({}),
  date: z.preprocess(value=>value===''?undefined:value,z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()),
  selections: z.object({event:z.string().max(60).optional(),ticket:z.string().max(60).optional(),travel:z.string().max(60).optional(),hotel:z.string().max(60).optional()}).default({}),
  optimize: z.boolean().default(false),
});
export type AgentDecision = z.infer<typeof decisionSchema>;
export const agentReplySchema = z.object({message:z.string(),requirements:requirementsSchema,plan:planSchema.optional(),provider:z.enum(modelProviders),model:z.string()});
