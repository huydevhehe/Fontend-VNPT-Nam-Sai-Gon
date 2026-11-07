import { Pool } from "pg";
import { config } from "../config/index.js";

// Pool được tạo lazy để tránh mở kết nối ngay khi module được import.
let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: config.databaseUrl });
  }
  return pool;
}

// Chuyển placeholder kiểu sqlite "?" sang kiểu Postgres "$1, $2, ..."
// theo đúng thứ tự xuất hiện trong câu SQL.
export function toPgPlaceholders(sql: string): string {
  let index = 0;
  return sql.replace(/\?/g, () => {
    index += 1;
    return `$${index}`;
  });
}

export const pgQuery = async <T = any>(sql: string, params: any[] = []): Promise<T[]> => {
  const pgSql = toPgPlaceholders(sql);
  const result = await getPool().query(pgSql, params);
  return result.rows as T[];
};

export const pgRun = async (
  sql: string,
  params: any[] = []
): Promise<{ id: number; changes: number }> => {
  const pgSql = toPgPlaceholders(sql);
  const result = await getPool().query(pgSql, params);
  const firstRow = result.rows?.[0];
  const id = firstRow && "id" in firstRow ? Number(firstRow.id) : 0;
  return { id, changes: result.rowCount ?? 0 };
};
