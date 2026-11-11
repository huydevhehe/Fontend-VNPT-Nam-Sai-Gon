import { test } from "node:test";
import assert from "node:assert/strict";
import {
  applyTableFilters,
  distinctOptions,
  TableFilter,
} from "./table-filters";

interface SampleRow {
  id: string;
  status?: string | null;
  staff?: string | null;
  ward?: string | null;
}

test("applyTableFilters returns all rows when no value selected", () => {
  const rows: SampleRow[] = [
    { id: "1", status: "A", staff: "X" },
    { id: "2", status: "B", staff: "Y" },
  ];
  const filters: TableFilter<SampleRow>[] = [
    { id: "status", label: "Trạng thái", getValue: (r) => r.status },
    { id: "staff", label: "Nhân viên", getValue: (r) => r.staff },
  ];

  const resultEmpty = applyTableFilters(rows, filters, {});
  assert.equal(resultEmpty.length, 2);

  const resultAllBlank = applyTableFilters(rows, filters, { status: "", staff: "" });
  assert.equal(resultAllBlank.length, 2);
});

test("applyTableFilters combines multiple filters with AND", () => {
  const rows: SampleRow[] = [
    { id: "1", status: "A", staff: "X" },
    { id: "2", status: "A", staff: "Y" },
    { id: "3", status: "B", staff: "X" },
    { id: "4", status: "B", staff: "Y" },
  ];
  const filters: TableFilter<SampleRow>[] = [
    { id: "status", label: "Trạng thái", getValue: (r) => r.status },
    { id: "staff", label: "Nhân viên", getValue: (r) => r.staff },
  ];

  const result = applyTableFilters(rows, filters, { status: "A", staff: "X" });
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "1");
});

test("applyTableFilters treats null value as non-matching", () => {
  const rows: SampleRow[] = [
    { id: "1", status: "A" },
    { id: "2", status: null },
    { id: "3", status: undefined },
  ];
  const filters: TableFilter<SampleRow>[] = [
    { id: "status", label: "Trạng thái", getValue: (r) => r.status },
  ];

  const result = applyTableFilters(rows, filters, { status: "A" });
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "1");
});

test("distinctOptions dedupes, drops empty and sorts Vietnamese", () => {
  const rows: SampleRow[] = [
    { id: "1", ward: "Tân Mỹ" },
    { id: "2", ward: "" },
    { id: "3", ward: null },
    { id: "4", ward: "An Phú" },
    { id: "5", ward: "Tân Mỹ" },
    { id: "6", ward: undefined },
  ];
  const filter: TableFilter<SampleRow> = {
    id: "ward",
    label: "Phường",
    getValue: (r) => r.ward,
  };

  const options = distinctOptions(rows, filter);
  assert.deepEqual(options, ["An Phú", "Tân Mỹ"]);
});
