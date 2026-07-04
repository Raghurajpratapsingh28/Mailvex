import type { PaginatedResponse, PaginationParams } from "../types/index.js";
import type { HttpClient } from "../http/http-client.js";

export interface ListParams extends PaginationParams {
  [key: string]: string | number | boolean | undefined | null;
}

export async function* paginate<T>(
  client: HttpClient,
  path: string,
  params: ListParams = {}
): AsyncGenerator<T> {
  let page = params.page ?? 1;
  const pageSize = params.pageSize ?? 50;

  while (true) {
    const res = await client.get<PaginatedResponse<T>>(path, {
      ...params,
      page,
      pageSize,
    });

    for (const item of res.items) {
      yield item;
    }

    if (page * pageSize >= res.total) break;
    page++;
  }
}