export const filterEnglishName = (value: string) => value.replace(/[^A-Za-z '-]/g, "");
export const NAME_PATTERN = "[A-Za-z]+(?:[ '\\-][A-Za-z]+)*";
export const isEnglishName = (name: string) => new RegExp(`^(?:${NAME_PATTERN})$`).test(name.trim());
export type Reply = {name:string; attendance:'yes'|'no'; adults:number; adultNames:string[]; childrenAges:number[]};
export function parseReply(value: unknown): Reply {
  if (!value || typeof value !== 'object') throw new Error('Invalid reply');
  const v = value as Record<string, unknown>;
  if (typeof v.name !== 'string' || !isEnglishName(v.name) || v.name.trim().length > 100 || !['yes','no'].includes(String(v.attendance))) throw new Error('Invalid name or attendance');
  if (v.attendance === 'no') return {name:v.name.trim(), attendance:'no', adults:0, adultNames:[], childrenAges:[]};
  if (!Number.isInteger(v.adults) || Number(v.adults)<1 || Number(v.adults)>4 || !Array.isArray(v.childrenAges) || v.childrenAges.length>20 || v.childrenAges.some(a => !Number.isInteger(a) || a<0 || a>17)) throw new Error('Invalid counts');
  const names = v.adultNames;
  if (!Array.isArray(names) || names.length !== v.adults || names.some(n => typeof n !== 'string' || !isEnglishName(n) || n.trim().length > 100) || names[0].trim() !== v.name.trim()) throw new Error('Invalid adult names');
  return {name:v.name.trim(),adultNames:names.map(n => n.trim()),attendance:'yes',adults:Number(v.adults),childrenAges:v.childrenAges};
}
