/**
 * Format raw complex IDs (e.g., UUIDs or Razorpay strings like cust_TGejybyg2MdziR)
 * into simple, easy-to-read numeric IDs (e.g. #948201).
 */
export function formatSimpleId(id?: string | null): string {
  if (!id) return "#100001";
  
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const numericId = (Math.abs(hash) % 900000) + 100000;
  return `#${numericId}`;
}
