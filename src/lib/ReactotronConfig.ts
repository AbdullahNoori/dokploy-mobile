import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import Reactotron from "reactotron-react-native";

declare global {
  interface Console {
    tron?: typeof Reactotron;
  }
}

type DisplayPayload = {
  name: string;
  preview?: string;
  value?: unknown;
  important?: boolean;
};

const resolveHost = () => {
  const expoConfig = Constants.expoConfig as Record<string, any> | undefined;
  const manifest = Constants.manifest as Record<string, any> | null | undefined;
  const debuggerHost =
    expoConfig?.hostUri ??
    expoConfig?.debuggerHost ??
    manifest?.debuggerHost ??
    "";

  if (!debuggerHost) {
    return "localhost";
  }

  const [host] = debuggerHost.split(":");
  return host ?? "localhost";
};

const reactotron =
  __DEV__
    ? Reactotron.setAsyncStorageHandler(AsyncStorage)
        .configure({
          name: "Tarkeeb DevTools",
          host: resolveHost(),
        })
        .useReactNative({
          networking: {
            ignoreUrls: /symbolicate|generate_204/,
          },
        })
        .connect()
    : undefined;

if (__DEV__ && reactotron) {
  reactotron.clear?.();
  console.tron = reactotron;
} else {
  console.tron = undefined;
}

const display = ({ name, preview, value, important }: DisplayPayload) => {
  console.tron?.display({
    name,
    preview,
    value,
    important,
  });
};

const formatPreview = (method?: string, url?: string) => {
  const safeMethod = method?.toUpperCase() ?? "GET";
  if (!url) return safeMethod;
  return `${safeMethod} ${url}`;
};

export const reactotronLoggers = {
  apiRequest: (payload: {
    method?: string;
    url?: string;
    headers?: unknown;
    data?: unknown;
  }) =>
    display({
      name: "API Request",
      preview: formatPreview(payload.method, payload.url),
      value: payload,
    }),
  apiResponse: (payload: {
    url?: string;
    status?: number;
    data?: unknown;
  }) =>
    display({
      name: "API Response",
      preview: `${payload.status ?? ""} ${payload.url ?? ""}`.trim(),
      value: payload,
    }),
  apiError: (payload: {
    url?: string;
    status?: number;
    message?: string;
    data?: unknown;
  }) =>
    display({
      name: "API Error",
      preview: `${payload.status ?? ""} ${payload.url ?? ""}`.trim(),
      value: payload,
      important: true,
    }),
  tokenRefresh: (payload: {
    state: "start" | "success" | "error";
    reason?: string;
  }) =>
    display({
      name: "Token Refresh",
      preview: payload.state,
      value: payload,
      important: payload.state === "error",
    }),
  swrFetch: (payload: { url: string }) =>
    display({
      name: "SWR Fetch",
      preview: payload.url,
      value: payload,
    }),
  swrResponse: (payload: { url: string; data: unknown }) =>
    display({
      name: "SWR Response",
      preview: payload.url,
      value: payload.data,
    }),
};

export default reactotron;
