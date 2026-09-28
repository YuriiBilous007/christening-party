export type Reply = {name:string; attendance:'yes'|'no'; adults:number; childrenAges:number[]};
export function parseReply(value: unknown): Reply {
  if (!value || typeof value !== 'object') throw new Error('Invalid reply');
  const v = value as Record<string, unknown>;
  if (typeof v.name !== 'string' || !v.name.trim() || v.name.trim().length > 100 || !['yes','no'].includes(String(v.attendance))) throw new Error('Invalid name or attendance');
  if (v.attendance === 'no') return {name:v.name.trim(), attendance:'no', adults:0, childrenAges:[]};
  if (!Number.isInteger(v.adults) || Number(v.adults)<1 || Number(v.adults)>50 || !Array.isArray(v.childrenAges) || v.childrenAges.length>20 || v.childrenAges.some(a => !Number.isInteger(a) || a<0 || a>17)) throw new Error('Invalid counts');
  return {name:v.name.trim(),attendance:'yes',adults:Number(v.adults),childrenAges:v.childrenAges};
}
