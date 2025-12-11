import {
  AxiosError,
  AxiosResponse,
  HttpStatusCode,
  InternalAxiosRequestConfig,
} from "axios";
import { UseFormSetError } from "react-hook-form";

export type InputError = {
  field: string;
  message: string;
};

export class HttpError {
  public code?: string;
  public message?: string;
  public response?: AxiosResponse;
  public config?: InternalAxiosRequestConfig;
  public request?: any;

  constructor(private error: AxiosError) {
    this.error = error;

    this.code = error.code;
    this.message = extractMessage(error);
    this.response = error.response;
    this.config = error.config;
    this.request = error.request;
  }

  public get getOriginal(): AxiosError {
    return this.error;
  }

  public get getValidationErrors() {
    if (!this.isValidation) {
      return [];
    }

    return (this.error.response?.data as any).message as InputError[];
  }

  public get isValidation() {
    return this.error.response?.status === HttpStatusCode.UnprocessableEntity;
  }

  public applyValidations(setError: UseFormSetError<any>) {
    if (!this.isValidation) {
      return;
    }

    const errors = (this.error.response?.data as any).message as InputError[];
    errors.forEach(({ field, message }) => setError(field, { message }));
  }

  public toJSON() {
    return {
      code: this.code,
      message: this.message,
      response: this.response,
      config: this.config,
      request: this.request,
    };
  }
}

const extractMessage = (error: AxiosError): string | undefined => {
  const fallback = error.message;
  const data = error.response?.data;

  if (!data) {
    return fallback;
  }

  if (typeof data === "string") {
    return data;
  }

  if (typeof data === "object" && data !== null) {
    const detail = (data as any).detail;
    if (typeof detail === "string") {
      return detail;
    }

    const message = (data as any).message;
    if (typeof message === "string") {
      return message;
    }

    if (Array.isArray(message)) {
      const parts = message.filter((item) => typeof item === "string");
      if (parts.length > 0) {
        return parts.join("\n");
      }
    }

    const firstString = Object.values(data).find(
      (value) => typeof value === "string"
    );
    if (typeof firstString === "string") {
      return firstString;
    }
  }

  return fallback;
};
