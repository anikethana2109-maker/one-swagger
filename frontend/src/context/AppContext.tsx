import React, { createContext, useContext, useState, useEffect } from 'react';
import { OpenApiSpec, TagGroupData, ParsedEndpoint } from '../types/openapi';
import { HttpRequestConfig, HttpResponseResult } from '../types/http';
import { parseOpenApiSpec } from '../features/spec-explorer/services/specParser';
import { executeHttpRequest } from '../features/playground/services/httpRunner';

const URL_STORAGE_KEY = 'oneswagger_url';
const TOKEN_STORAGE_KEY = 'oneswagger_auth_token';

interface AppContextType {
  serverUrl: string;
  setServerUrl: (url: string) => void;
  spec: OpenApiSpec | null;
  tagGroups: TagGroupData[];
  rawEndpoints: ParsedEndpoint[];
  isLoadingSpec: boolean;
  specError: string | null;
  loadSpecFromUrl: (url: string) => Promise<void>;
  refreshSpec: () => Promise<void>;

  selectedEndpoint: ParsedEndpoint | null;
  setSelectedEndpoint: (endpoint: ParsedEndpoint | null) => void;

  requestConfig: HttpRequestConfig;
  setRequestConfig: React.Dispatch<React.SetStateAction<HttpRequestConfig>>;
  responseResult: HttpResponseResult | null;
  setResponseResult: (res: HttpResponseResult | null) => void;
  isExecuting: boolean;
  executeCurrentRequest: () => Promise<void>;

  authToken: string;
  setAuthToken: (token: string) => void;

  isHistoryOpen: boolean;
  setIsHistoryOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isCodeGenOpen: boolean;
  setIsCodeGenOpen: (open: boolean) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;

  loadHistoryIntoEditor: (itemUrl: string, itemMethod: string, itemBody?: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

declare const chrome: any;

async function fetchJsonSafe(targetUrl: string): Promise<{ ok: boolean; data?: any; error?: string }> {
  if (typeof chrome !== 'undefined' && chrome?.runtime?.sendMessage) {
    try {
      const proxyResponse = await new Promise<any>((resolve) => {
        chrome.runtime.sendMessage(
          {
            type: 'FETCH_PROXY',
            payload: {
              url: targetUrl,
              options: { method: 'GET' }
            }
          },
          (res: any) => {
            if (chrome.runtime?.lastError) resolve(null);
            else resolve(res);
          }
        );
      });
      if (proxyResponse && proxyResponse.success && proxyResponse.data) {
        return { ok: true, data: proxyResponse.data.data };
      }
    } catch {}
  }

  try {
    const res = await fetch(targetUrl);
    if (res.ok) {
      const data = await res.json();
      return { ok: true, data };
    }
  } catch {}

  try {
    const proxyUrl = `/__cors_proxy?url=${encodeURIComponent(targetUrl)}`;
    const proxyRes = await fetch(proxyUrl);
    if (proxyRes.ok) {
      const data = await proxyRes.json();
      return { ok: true, data };
    }
  } catch {}

  return { ok: false, error: 'Could not connect to target URL directly or via proxy' };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [serverUrl, setServerUrlState] = useState<string>(() => {
    return localStorage.getItem(URL_STORAGE_KEY) || 'http://127.0.0.1:8000/openapi.json';
  });

  const [spec, setSpec] = useState<OpenApiSpec | null>(null);
  const [tagGroups, setTagGroups] = useState<TagGroupData[]>([]);
  const [rawEndpoints, setRawEndpoints] = useState<ParsedEndpoint[]>([]);
  const [isLoadingSpec, setIsLoadingSpec] = useState<boolean>(false);
  const [specError, setSpecError] = useState<string | null>(null);

  const [selectedEndpoint, setSelectedEndpoint] = useState<ParsedEndpoint | null>(null);
  const [requestConfig, setRequestConfig] = useState<HttpRequestConfig>({
    url: 'http://127.0.0.1:8000/api/v1/products',
    method: 'GET',
    headers: {},
    params: {},
    body: undefined
  });
  const [responseResult, setResponseResult] = useState<HttpResponseResult | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const [authToken, setAuthTokenState] = useState<string>(() => {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  });

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCodeGenOpen, setIsCodeGenOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const setServerUrl = (url: string) => {
    setServerUrlState(url);
    localStorage.setItem(URL_STORAGE_KEY, url);
  };

  const setAuthToken = (token: string) => {
    setAuthTokenState(token);
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  };

  const loadSpecFromUrl = async (url: string) => {
    setIsLoadingSpec(true);
    setSpecError(null);
    setServerUrl(url);

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `http://${targetUrl}`;
    }

    try {
      let result = await fetchJsonSafe(targetUrl);

      if (!result.ok) {
        if (!targetUrl.endsWith('/openapi.json') && !targetUrl.endsWith('/swagger.json')) {
          const fallbackUrl = `${targetUrl.replace(/\/$/, '')}/openapi.json`;
          result = await fetchJsonSafe(fallbackUrl);
          if (result.ok) {
            setServerUrl(fallbackUrl);
          }
        }
      }

      if (!result.ok || !result.data) {
        throw new Error(`Failed to load OpenAPI specification from ${targetUrl}`);
      }

      const specData = result.data;
      if (!specData || (!specData.openapi && !specData.swagger && !specData.paths)) {
        throw new Error('Valid OpenAPI specification not found at this endpoint');
      }

      setSpec(specData);
      const parsed = parseOpenApiSpec(specData);
      setTagGroups(parsed.tagGroups);
      setRawEndpoints(parsed.rawEndpoints);

      if (parsed.rawEndpoints.length > 0) {
        const first = parsed.rawEndpoints[0];
        let baseUrl = 'http://127.0.0.1:8000';
        try {
          baseUrl = new URL(targetUrl).origin;
        } catch {}
        setSelectedEndpoint(first);
        setRequestConfig({
          url: `${baseUrl}${first.path}`,
          method: first.method,
          headers: {},
          params: {},
          body: undefined
        });
      }
    } catch (err: any) {
      setSpecError(err.message || 'Could not connect to API server.');
    } finally {
      setIsLoadingSpec(false);
    }
  };

  const refreshSpec = async () => {
    if (serverUrl) {
      await loadSpecFromUrl(serverUrl);
    }
  };

  const executeCurrentRequest = async () => {
    setIsExecuting(true);
    setResponseResult(null);
    try {
      const res = await executeHttpRequest(requestConfig, authToken);
      setResponseResult(res);
    } catch (err: any) {
      setResponseResult({
        status: 0,
        statusText: 'Execution Error',
        headers: {},
        data: { error: err.message },
        rawText: err.message,
        latencyMs: 0,
        sizeBytes: 0,
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const loadHistoryIntoEditor = (itemUrl: string, itemMethod: string, itemBody?: any) => {
    setRequestConfig((prev) => ({
      ...prev,
      url: itemUrl,
      method: itemMethod.toLowerCase(),
      body: itemBody
    }));
    setIsHistoryOpen(false);
  };

  useEffect(() => {
    if (serverUrl) {
      loadSpecFromUrl(serverUrl);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        serverUrl,
        setServerUrl,
        spec,
        tagGroups,
        rawEndpoints,
        isLoadingSpec,
        specError,
        loadSpecFromUrl,
        refreshSpec,
        selectedEndpoint,
        setSelectedEndpoint,
        requestConfig,
        setRequestConfig,
        responseResult,
        setResponseResult,
        isExecuting,
        executeCurrentRequest,
        authToken,
        setAuthToken,
        isHistoryOpen,
        setIsHistoryOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        isCodeGenOpen,
        setIsCodeGenOpen,
        isSidebarOpen,
        setIsSidebarOpen,
        loadHistoryIntoEditor
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
