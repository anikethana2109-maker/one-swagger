export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';

export interface OpenApiParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  description?: string;
  required?: boolean;
  schema?: {
    type?: string;
    default?: any;
    enum?: any[];
    format?: string;
    items?: any;
  };
  example?: any;
}

export interface OpenApiRequestBody {
  description?: string;
  required?: boolean;
  content?: {
    [mediaType: string]: {
      schema?: any;
      example?: any;
      examples?: Record<string, any>;
    };
  };
}

export interface OpenApiResponse {
  description?: string;
  content?: {
    [mediaType: string]: {
      schema?: any;
      example?: any;
    };
  };
}

export interface OpenApiOperation {
  tags?: string[];
  summary?: string;
  description?: string;
  operationId?: string;
  parameters?: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses?: Record<string, OpenApiResponse>;
}

export interface OpenApiPathItem {
  get?: OpenApiOperation;
  post?: OpenApiOperation;
  put?: OpenApiOperation;
  delete?: OpenApiOperation;
  patch?: OpenApiOperation;
  options?: OpenApiOperation;
  head?: OpenApiOperation;
}

export interface OpenApiSpec {
  openapi?: string;
  swagger?: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers?: Array<{
    url: string;
    description?: string;
  }>;
  paths: Record<string, OpenApiPathItem>;
  components?: {
    schemas?: Record<string, any>;
    securitySchemes?: Record<string, any>;
  };
}

export interface ParsedEndpoint {
  id: string;
  path: string;
  method: HttpMethod;
  summary: string;
  description?: string;
  tags: string[];
  parameters: OpenApiParameter[];
  requestBody?: OpenApiRequestBody;
  responses: Record<string, OpenApiResponse>;
}

export interface TagGroupData {
  tag: string;
  description?: string;
  endpoints: ParsedEndpoint[];
}
