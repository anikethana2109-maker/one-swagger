import React, { useState, useEffect } from 'react';
import { useApp } from '../../../context/AppContext';

export const SettingsModal: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, authToken, setAuthToken, spec, serverUrl } = useApp();

  const [activeScheme, setActiveScheme] = useState<string>('');
  const [bearerToken, setBearerToken] = useState(authToken);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [credLocation, setCredLocation] = useState('Authorization header');
  const [saved, setSaved] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Extract securitySchemes from the loaded spec (works for ANY backend)
  const securitySchemes = spec?.components?.securitySchemes || {};
  const schemeNames = Object.keys(securitySchemes);

  useEffect(() => {
    if (isSettingsOpen) {
      setBearerToken(authToken);
      setLoginError('');
      setSaved(false);
      if (schemeNames.length > 0 && !activeScheme) {
        setActiveScheme(schemeNames[0]);
      }
    }
  }, [isSettingsOpen]);

  if (!isSettingsOpen) return null;

  const currentScheme = activeScheme ? securitySchemes[activeScheme] : null;
  const schemeType = currentScheme?.type || 'http';
  const schemeScheme = currentScheme?.scheme || 'bearer';
  const isOAuth2 = schemeType === 'oauth2';
  const isBearer = schemeType === 'http' && schemeScheme === 'bearer';
  const isApiKey = schemeType === 'apiKey';

  // Detect OAuth2 flow details
  const oauth2Flows = currentScheme?.flows || {};
  const passwordFlow = oauth2Flows.password;
  const implicitFlow = oauth2Flows.implicit;
  const clientCredFlow = oauth2Flows.clientCredentials;
  const authCodeFlow = oauth2Flows.authorizationCode;
  const tokenUrl = passwordFlow?.tokenUrl || clientCredFlow?.tokenUrl || authCodeFlow?.tokenUrl || '';

  const getSchemeLabel = () => {
    if (isOAuth2) {
      const flowType = passwordFlow ? 'password' : implicitFlow ? 'implicit' : clientCredFlow ? 'clientCredentials' : authCodeFlow ? 'authorizationCode' : 'unknown';
      return `${activeScheme} (OAuth2, ${flowType})`;
    }
    if (isBearer) return `${activeScheme} (http, Bearer)`;
    if (isApiKey) return `${activeScheme} (apiKey, ${currentScheme?.in || 'header'})`;
    return activeScheme;
  };

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Direct Bearer Token
    if (bearerToken.trim()) {
      setAuthToken(bearerToken.trim());
      setSaved(true);
      setTimeout(() => { setSaved(false); setIsSettingsOpen(false); }, 600);
      return;
    }

    // OAuth2 Password Flow - try to authenticate
    if (isOAuth2 && passwordFlow && username.trim() && password.trim()) {
      try {
        let loginUrl = tokenUrl;
        // Resolve relative token URLs against the backend origin
        if (loginUrl && !loginUrl.startsWith('http')) {
          try {
            const origin = new URL(serverUrl).origin;
            loginUrl = `${origin}/${loginUrl.replace(/^\//, '')}`;
          } catch {}
        }

        // Try form-urlencoded first (standard OAuth2)
        const formBody = new URLSearchParams();
        formBody.append('grant_type', 'password');
        formBody.append('username', username.trim());
        formBody.append('password', password.trim());
        if (clientId) formBody.append('client_id', clientId);
        if (clientSecret) formBody.append('client_secret', clientSecret);

        let res = await fetch(loginUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formBody.toString()
        });

        // If form-urlencoded fails, try JSON body (common in custom backends)
        if (!res.ok) {
          res = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: username.trim(),
              email: username.trim(),
              password: password.trim(),
              client_id: clientId || undefined,
              client_secret: clientSecret || undefined,
            })
          });
        }

        if (res.ok) {
          const data = await res.json();
          const token = data.access_token || data.token || data.jwt || data.id_token;
          if (token) {
            setAuthToken(token);
            setBearerToken(token);
            setSaved(true);
            setTimeout(() => { setSaved(false); setIsSettingsOpen(false); }, 600);
            return;
          } else {
            setLoginError('Login succeeded but no token field found in response (tried: access_token, token, jwt, id_token)');
          }
        } else {
          const errText = await res.text();
          setLoginError(`Login failed (${res.status}): ${errText.slice(0, 200)}`);
        }
      } catch (err: any) {
        setLoginError(`Network error: ${err.message}`);
      }
      return;
    }

    // API Key
    if (isApiKey && bearerToken.trim()) {
      setAuthToken(bearerToken.trim());
      setSaved(true);
      setTimeout(() => { setSaved(false); setIsSettingsOpen(false); }, 600);
      return;
    }

    setLoginError('Please enter a token or credentials to authorize.');
  };

  const handleLogout = () => {
    setAuthToken('');
    setBearerToken('');
    setSaved(false);
    setIsSettingsOpen(false);
  };

  return (
    <div
      onClick={() => setIsSettingsOpen(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0, 0, 0, 0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 560,
          background: '#ffffff', borderRadius: 4,
          border: '1px solid #cbd5e1',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
          overflow: 'hidden', maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
        }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1e293b' }}>
            Available authorizations
          </h2>
          <button
            onClick={() => setIsSettingsOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 18, fontWeight: 700 }}
          >
            x
          </button>
        </div>

        <form onSubmit={handleAuthorize} style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
            Scopes are used to grant an application different levels of access to data on behalf of the end user.
            Each API may declare one or more scopes. Select which ones you want to grant to Swagger UI.
          </p>

          {/* Scheme Tabs (if multiple security schemes exist) */}
          {schemeNames.length > 1 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {schemeNames.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setActiveScheme(name)}
                  style={{
                    padding: '4px 10px', fontSize: 11, fontWeight: 600, borderRadius: 4, cursor: 'pointer',
                    background: activeScheme === name ? '#49cc90' : '#f1f5f9',
                    color: activeScheme === name ? '#fff' : '#475569',
                    border: activeScheme === name ? '1px solid #49cc90' : '1px solid #e2e8f0',
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          <div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: 14, fontWeight: 800, color: '#1e293b' }}>
              {getSchemeLabel()}
            </h3>

            {/* OAuth2 Password Flow */}
            {isOAuth2 && passwordFlow && (
              <>
                <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'Source Code Pro, monospace', marginBottom: 12 }}>
                  Token URL: {tokenUrl}<br />
                  Flow: password
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>username:</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', border: '1.5px solid #1e293b', borderRadius: 4, padding: '8px 10px', fontSize: 12, outline: 'none' }} />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>password:</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: 4, padding: '8px 10px', fontSize: 12, outline: 'none' }} />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>Client credentials location:</label>
                  <select value={credLocation} onChange={(e) => setCredLocation(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #1e293b', borderRadius: 4, padding: '8px 10px', fontSize: 12, outline: 'none', background: '#fff' }}>
                    <option>Authorization header</option>
                    <option>Request body</option>
                  </select>
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>client_id:</label>
                  <input type="text" value={clientId} onChange={(e) => setClientId(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: 4, padding: '8px 10px', fontSize: 12, outline: 'none' }} />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>client_secret:</label>
                  <input type="password" value={clientSecret} onChange={(e) => setClientSecret(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: 4, padding: '8px 10px', fontSize: 12, outline: 'none' }} />
                </div>
              </>
            )}

            {/* Bearer HTTP Auth */}
            {isBearer && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'Source Code Pro, monospace', marginBottom: 8 }}>
                  Name: Authorization<br />
                  In: header<br />
                  Bearer format: "{currentScheme?.bearerFormat || 'JWT'}"
                </div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>Value:</label>
                <input type="text" value={bearerToken} onChange={(e) => setBearerToken(e.target.value)}
                  placeholder="Bearer eyJhbGciOiJIUzI1Ni..."
                  style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: 4, padding: '8px 10px', fontSize: 12, fontFamily: 'Source Code Pro, monospace', outline: 'none' }} />
              </div>
            )}

            {/* API Key */}
            {isApiKey && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: '#64748b', fontFamily: 'Source Code Pro, monospace', marginBottom: 8 }}>
                  Name: {currentScheme?.name || 'X-API-Key'}<br />
                  In: {currentScheme?.in || 'header'}
                </div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>Value:</label>
                <input type="text" value={bearerToken} onChange={(e) => setBearerToken(e.target.value)}
                  placeholder="your-api-key-here"
                  style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: 4, padding: '8px 10px', fontSize: 12, fontFamily: 'Source Code Pro, monospace', outline: 'none' }} />
              </div>
            )}

            {/* No schemes detected - generic Bearer fallback */}
            {schemeNames.length === 0 && (
              <>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>
                  No securitySchemes found in specification. Enter a Bearer token or API key directly.
                </div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>Bearer Token / API Key:</label>
                <input type="text" value={bearerToken} onChange={(e) => setBearerToken(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1Ni..."
                  style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: 4, padding: '8px 10px', fontSize: 12, fontFamily: 'Source Code Pro, monospace', outline: 'none' }} />
              </>
            )}

            {/* Direct token fallback for OAuth2 too */}
            {isOAuth2 && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed #cbd5e1' }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>
                  Or paste a Bearer JWT token directly:
                </label>
                <input type="text" value={bearerToken} onChange={(e) => setBearerToken(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1Ni..."
                  style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: 4, padding: '6px 10px', fontSize: 11, fontFamily: 'Source Code Pro, monospace', outline: 'none' }} />
              </div>
            )}

            {/* Auth Status Indicator */}
            {authToken && (
              <div style={{
                marginTop: 10, padding: '8px 12px', borderRadius: 4,
                background: 'rgba(73, 204, 144, 0.1)', border: '1px solid rgba(73, 204, 144, 0.3)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <svg style={{ width: 14, height: 14, color: '#49cc90', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                </svg>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#059669' }}>Authorized</span>
                  <span style={{ fontSize: 10, color: '#64748b', fontFamily: 'Source Code Pro, monospace', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {authToken.slice(0, 40)}...
                  </span>
                </div>
              </div>
            )}

            {/* Error */}
            {loginError && (
              <div style={{
                marginTop: 8, padding: '8px 12px', borderRadius: 4,
                background: '#fef2f2', border: '1px solid #fecaca',
                fontSize: 11, color: '#dc2626', lineHeight: 1.4,
              }}>
                {loginError}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, paddingTop: 8 }}>
            {authToken && (
              <button type="button" onClick={handleLogout}
                style={{ background: 'transparent', border: '2px solid #ef4444', borderRadius: 4, padding: '7px 20px', fontSize: 13, fontWeight: 800, color: '#ef4444', cursor: 'pointer' }}>
                Logout
              </button>
            )}

            <button type="submit"
              style={{ background: 'transparent', border: '2px solid #49cc90', borderRadius: 4, padding: '7px 24px', fontSize: 13, fontWeight: 800, color: '#49cc90', cursor: 'pointer' }}>
              {saved ? 'Authorized!' : 'Authorize'}
            </button>

            <button type="button" onClick={() => setIsSettingsOpen(false)}
              style={{ background: 'transparent', border: '2px solid #475569', borderRadius: 4, padding: '7px 24px', fontSize: 13, fontWeight: 800, color: '#334155', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
