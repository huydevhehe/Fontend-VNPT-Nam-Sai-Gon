export interface TableFilter<T> {
  id: string; // khóa duy nhất trong bảng
  label: string; // nhãn hiển thị, vd "Trạng thái"
  getValue: (row: T) => string | null | undefined;
  options?: string[]; // không truyền → tự lấy distinct từ data
}

export type FilterValues = Record<string, string>; // id → giá trị chọn; "" = Tất cả

export function distinctOptions<T>(rows: T[], filter: TableFilter<T>): string[] {
  if (filter.options && filter.options.length > 0) {
    return filter.options;
  }
  const set = new Set<string>();
  for (const row of rows) {
    const val = filter.getValue(row);
    if (val !== null && val !== undefined) {
      const trimmed = String(val).trim();
      if (trimmed.length > 0) {
        set.add(trimmed);
      }
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, "vi"));
}

export function applyTableFilters<T>(
  rows: T[],
  filters: TableFilter<T>[],
  values: FilterValues
): T[] {
  if (!filters || filters.length === 0) return rows;

  return rows.filter((row) => {
    for (const filter of filters) {
      const selectedValue = values[filter.id];
      if (selectedValue !== undefined && selectedValue !== "") {
        const rowVal = filter.getValue(row);
        if (rowVal === null || rowVal === undefined) {
          return false;
        }
        if (String(rowVal).trim() !== selectedValue.trim()) {
          return false;
        }
      }
    }
    return true;
  });
}
