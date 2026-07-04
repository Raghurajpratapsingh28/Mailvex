import type { HttpClient } from "../http/http-client.js";
import type {
  PaginatedResponse,
  PaginationParams,
  Workflow,
  WorkflowExecution,
  WorkflowGraph,
} from "../types/index.js";
import { paginate } from "../utils/pagination.js";

export interface CreateWorkflowParams {
  name: string;
  graph: WorkflowGraph;
}

export interface UpdateWorkflowParams {
  name?: string;
  graph?: WorkflowGraph;
}

export interface ListWorkflowsParams extends PaginationParams {
  [key: string]: string | number | boolean | undefined | null;
}
export interface ListExecutionsParams extends PaginationParams {
  [key: string]: string | number | boolean | undefined | null;
}

export class WorkflowsResource {
  constructor(private readonly http: HttpClient) {}

  async create(params: CreateWorkflowParams): Promise<Workflow> {
    const res = await this.http.post<{ workflow: Workflow }>(
      "/api/v1/workflows",
      params
    );
    return res.workflow;
  }

  async list(params: ListWorkflowsParams = {}): Promise<PaginatedResponse<Workflow>> {
    return this.http.get<PaginatedResponse<Workflow>>("/api/v1/workflows", params);
  }

  async *listAll(params: ListWorkflowsParams = {}): AsyncGenerator<Workflow> {
    yield* paginate<Workflow>(this.http, "/api/v1/workflows", params);
  }

  async get(id: string): Promise<Workflow> {
    const res = await this.http.get<{ workflow: Workflow }>(`/api/v1/workflows/${id}`);
    return res.workflow;
  }

  async update(id: string, params: UpdateWorkflowParams): Promise<Workflow> {
    const res = await this.http.patch<{ workflow: Workflow }>(
      `/api/v1/workflows/${id}`,
      params
    );
    return res.workflow;
  }

  async publish(id: string): Promise<Workflow> {
    const res = await this.http.post<{ workflow: Workflow }>(
      `/api/v1/workflows/${id}/publish`
    );
    return res.workflow;
  }

  async pause(id: string): Promise<Workflow> {
    const res = await this.http.post<{ workflow: Workflow }>(
      `/api/v1/workflows/${id}/pause`
    );
    return res.workflow;
  }

  async resume(id: string): Promise<Workflow> {
    const res = await this.http.post<{ workflow: Workflow }>(
      `/api/v1/workflows/${id}/resume`
    );
    return res.workflow;
  }

  async delete(id: string): Promise<void> {
    return this.http.delete<void>(`/api/v1/workflows/${id}`);
  }

  async listExecutions(
    id: string,
    params: ListExecutionsParams = {}
  ): Promise<PaginatedResponse<WorkflowExecution>> {
    return this.http.get<PaginatedResponse<WorkflowExecution>>(
      `/api/v1/workflows/${id}/executions`,
      params
    );
  }
}