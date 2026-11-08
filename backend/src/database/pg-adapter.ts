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

export interface TransactionClient {
  query: <T = any>(sql: string, params?: any[]) => Promise<T[]>;
  run: (sql: string, params?: any[]) => Promise<{ id: number; changes: number }>;
}

export const pgTransaction = async <T>(
  callback: (tx: TransactionClient) => Promise<T>
): Promise<T> => {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const tx: TransactionClient = {
      query: async <R = any>(sql: string, params: any[] = []): Promise<R[]> => {
        const res = await client.query(toPgPlaceholders(sql), params);
        return res.rows as R[];
      },
      run: async (sql: string, params: any[] = []): Promise<{ id: number; changes: number }> => {
        const res = await client.query(toPgPlaceholders(sql), params);
        const firstRow = res.rows?.[0];
        const id = firstRow && "id" in firstRow ? Number(firstRow.id) : 0;
        return { id, changes: res.rowCount ?? 0 };
      },
    };
    const result = await callback(tx);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
