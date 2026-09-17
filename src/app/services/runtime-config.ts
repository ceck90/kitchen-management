interface RuntimeConfig {
  api?: {
    protocol: string;
    hostname: string;
    port?: string;
    context?: string | null;
  };
  webSocket?: {
    endpoint?: string;
    defaultTopic?: string;
    pkmiTopic?: string;
  };
}

declare global {
  interface Window {
    __KITCHEN_MANAGEMENT_CONFIG__?: RuntimeConfig;
  }
}

export const runtimeConfig: RuntimeConfig = window.__KITCHEN_MANAGEMENT_CONFIG__ || {};