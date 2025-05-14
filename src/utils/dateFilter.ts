import { InventoryRecord } from "@/types/(inventoryRecord)/inventory-record";

export function filterRecordsByDateRange(
  records: InventoryRecord[],
  startDate?: string,
  endDate?: string
): InventoryRecord[] {
  if (!records.length) return records;

  return records.filter((record) => {
    const recordDate = record.inboundDate || record.outboundDate;
    if (!recordDate) return false;

    const date = new Date(recordDate);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      return date >= start && date <= end;
    } else if (start) {
      return date >= start;
    } else if (end) {
      return date <= end;
    }

    return true;
  });
}
