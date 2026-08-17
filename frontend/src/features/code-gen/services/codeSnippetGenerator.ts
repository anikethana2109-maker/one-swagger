import { HttpRequestConfig } from '../../../types/http';

export function generateCurlSnippet(config: HttpRequestConfig, authToken?: string): string {
  const method = config.method.toUpperCase();
  let cmd = `curl -X ${method} "${config.url}"`;

  const headers = { ...config.headers };
  if (authToken && !headers['Authorization']) {
    headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
  }

  if (config.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  Object.entries(headers).forEach(([k, v]) => {
    cmd += ` \
  -H "${k}: ${v}"`;
  });

  if (config.body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const bodyStr = typeof config.body === 'object' ? JSON.stringify(config.body) : config.body;
    cmd += ` \
  -d '${bodyStr}'`;
  }

  return cmd;
}

export function generatePythonRequestsSnippet(config: HttpRequestConfig, authToken?: string): string {
  const method = config.method.toLowerCase();
  const headers = { ...config.headers };
  if (authToken && !headers['Authorization']) {
    headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
  }

  let code = `import requests

`;
  code += `url = "${config.url}"
`;
  code += `headers = ${JSON.stringify(headers, null, 4)}
`;

  if (config.body && ['post', 'put', 'patch', 'delete'].includes(method)) {
    code += `payload = ${typeof config.body === 'object' ? JSON.stringify(config.body, null, 4) : JSON.stringify(config.body)}

`;
    code += `response = requests.${method}(url, headers=headers, json=payload)
`;
  } else {
    code += `
response = requests.${method}(url, headers=headers)
`;
  }

  code += `print("Status:", response.status_code)
print(response.json())`;
  return code;
}

export function generateFetchSnippet(config: HttpRequestConfig, authToken?: string): string {
  const method = config.method.toUpperCase();
  const headers = { ...config.headers };
  if (authToken && !headers['Authorization']) {
    headers['Authorization'] = authToken.startsWith('Bearer ') ? authToken : `Bearer ${authToken}`;
  }
  if (config.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const options: any = { method, headers };
  if (config.body && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    options.body = typeof config.body === 'object' ? JSON.stringify(config.body) : config.body;
  }

  return `fetch("${config.url}", ${JSON.stringify(options, null, 2)})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));`;
}

export function generateGoSnippet(config: HttpRequestConfig, authToken?: string): string {
  const method = config.method.toUpperCase();
  return `package main

import (
    "bytes"
    "fmt"
    "io"
    "net/http"
)

func main() {
    url := "${config.url}"
    req, err := http.NewRequest("${method}", url, nil)
    if err != nil {
        panic(err)
    }

    ${authToken ? `req.Header.Set("Authorization", "Bearer ${authToken}")` : '// req.Header.Set("Authorization", "Bearer ...")'}
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()

    body, _ := io.ReadAll(resp.Body)
    fmt.Println(string(body))
}`;
}
