import { OpenApiSpec, ParsedEndpoint, TagGroupData, HttpMethod } from '../../../types/openapi';

const HTTP_METHODS: HttpMethod[] = ['get', 'post', 'put', 'delete', 'patch', 'options', 'head'];

/**
 * Recursively resolve all $ref references in an object against the root spec.
 * This handles nested $ref, arrays, and deep objects.
 */
function resolveRefs(obj: any, rootSpec: any, seen: Set<string> = new Set()): any {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => resolveRefs(item, rootSpec, seen));
  }

  if (obj['$ref'] && typeof obj['$ref'] === 'string') {
    const refPath = obj['$ref'];
    // Prevent infinite recursion
    if (seen.has(refPath)) return { type: 'object', description: `[Circular: ${refPath}]` };
    seen.add(refPath);

    // Resolve #/components/schemas/SomeName
    const parts = refPath.replace(/^#\//, '').split('/');
    let resolved: any = rootSpec;
    for (const part of parts) {
      if (resolved && typeof resolved === 'object') {
        resolved = resolved[part];
      } else {
        resolved = undefined;
        break;
      }
    }

    if (resolved) {
      return resolveRefs(resolved, rootSpec, new Set(seen));
    }
    return obj; // Unresolvable ref, return as-is
  }

  // Recursively resolve all keys
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = resolveRefs(value, rootSpec, new Set(seen));
  }
  return result;
}

export function parseOpenApiSpec(spec: OpenApiSpec): { tagGroups: TagGroupData[]; rawEndpoints: ParsedEndpoint[] } {
  const rawEndpoints: ParsedEndpoint[] = [];
  const tagMap: Record<string, ParsedEndpoint[]> = {};

  if (!spec.paths) {
    return { tagGroups: [], rawEndpoints: [] };
  }

  Object.entries(spec.paths).forEach(([path, pathItem]) => {
    if (!pathItem) return;

    HTTP_METHODS.forEach((method) => {
      const operation = pathItem[method];
      if (operation) {
        const tags = operation.tags && operation.tags.length > 0 ? operation.tags : ['default'];

        // Resolve $ref in parameters, requestBody, and responses
        const resolvedParams = resolveRefs(operation.parameters || [], spec);
        const resolvedRequestBody = resolveRefs(operation.requestBody, spec);
        const resolvedResponses = resolveRefs(operation.responses || {}, spec);

        const endpoint: ParsedEndpoint = {
          id: method + '-' + path,
          path,
          method,
          summary: operation.summary || operation.operationId || (method.toUpperCase() + ' ' + path),
          description: operation.description || '',
          tags,
          parameters: resolvedParams,
          requestBody: resolvedRequestBody,
          responses: resolvedResponses
        };

        rawEndpoints.push(endpoint);

        tags.forEach((tag) => {
          if (!tagMap[tag]) {
            tagMap[tag] = [];
          }
          tagMap[tag].push(endpoint);
        });
      }
    });
  });

  const tagGroups: TagGroupData[] = Object.entries(tagMap).map(([tag, endpoints]) => ({
    tag,
    description: '',
    endpoints
  }));

  return { tagGroups, rawEndpoints };
}
