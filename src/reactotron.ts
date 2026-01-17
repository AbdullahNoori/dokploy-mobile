import Reactotron from 'reactotron-react-native';

type ApiRequestPayload = {
  method?: string;
  url?: string;
  headers?: unknown;
  data?: unknown;
};

type ApiResponsePayload = {
  url?: string;
  status?: number;
  data?: unknown;
};

type ApiErrorPayload = {
  url?: string;
  status?: number;
  message?: string;
  data?: unknown;
};

type ReactotronLoggers = {
  apiRequest: (payload: ApiRequestPayload) => void;
  apiResponse: (payload: ApiResponsePayload) => void;
  apiError: (payload: ApiErrorPayload) => void;
};

const noop = () => undefined;

export const reactotronLoggers: ReactotronLoggers = {
  apiRequest: noop,
  apiResponse: noop,
  apiError: noop,
};

export const reactotron = __DEV__
  ? Reactotron.configure({ name: 'dokploy-mobile' })
      .useReactNative({
        networking: {
          ignoreUrls: /symbolicate/,
        },
      })
      .connect()
  : null;

if (__DEV__ && reactotron) {
  reactotronLoggers.apiRequest = (payload) => {
    reactotron.display({
      name: 'API Request',
      preview: `${payload.method ?? 'GET'} ${payload.url ?? ''}`.trim(),
      value: payload,
    });
  };

  reactotronLoggers.apiResponse = (payload) => {
    reactotron.display({
      name: 'API Response',
      preview: `${payload.status ?? ''} ${payload.url ?? ''}`.trim(),
      value: payload,
    });
  };

  reactotronLoggers.apiError = (payload) => {
    reactotron.display({
      name: 'API Error',
      preview: `${payload.status ?? 'ERR'} ${payload.url ?? ''}`.trim(),
      value: payload,
      important: true,
    });
  };
}
