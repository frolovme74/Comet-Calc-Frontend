/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ApiCometFeedResponse {
  comet_description?: string;
  comet_name?: string;
  comet_photo?: string;
  comet_photo_url?: string;
  comet_status?: string;
  comet_video?: string;
  comet_video_url?: string;
  created_at?: string;
  formed_at?: string;
  id?: number;
  is_liked?: number;
  likes_count?: number;
  orbit_eccentricity?: number;
  orbital_period?: number;
}

export interface ApiCometListResponse {
  comet_description?: string;
  comet_name?: string;
  comet_photo?: string;
  comet_photo_url?: string;
  comet_status?: string;
  comet_video?: string;
  comet_video_url?: string;
  created_at?: string;
  formed_at?: string;
  id?: number;
  is_mine?: number;
  likes_count?: number;
  orbit_eccentricity?: number;
  orbital_period?: number;
}

export interface ApiCometResponse {
  comet_description?: string;
  comet_name?: string;
  comet_photo?: string;
  comet_photo_url?: string;
  comet_status?: string;
  comet_video?: string;
  comet_video_url?: string;
  created_at?: string;
  formed_at?: string;
  id?: number;
  orbit_eccentricity?: number;
  orbital_period?: number;
}

export interface ApiDeleteResponse {
  comet_status?: string;
  id?: number;
}

export interface ApiLikeRequest {
  like?: number;
}

export interface ApiLikeResponse {
  comet_id?: number;
  like?: number;
  likes_count?: number;
}

export interface ApiLoginRequest {
  /** @example "frolov" */
  login?: string;
  /** @example "comets2026" */
  password?: string;
}

export interface ApiLoginResponse {
  access_token?: string;
  /** @example 3600 */
  expires_in?: number;
  /** @example "Bearer" */
  token_type?: string;
}

export interface ApiMessageResponse {
  message?: string;
  status?: string;
}

export interface ApiPublishCometRequest {
  comet_description?: string;
  orbit_eccentricity?: number;
  orbital_period?: number;
}

export interface ApiRegisterRequest {
  full_name?: string;
  login?: string;
  password?: string;
}

export interface ApiUserResponse {
  full_name?: string;
  id?: number;
  login?: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "/api",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Comet-Calc API
 * @version 1.0
 * @baseUrl /api
 * @contact
 *
 * Веб-сервис «Расстояние кометы от Солнца»: кометы (услуги), лайки, пользователи. Чтение доступно без авторизации, методы создателя — с JWT.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  comets = {
    /**
     * @description Опубликованные кометы с фильтром по периоду обращения. Доступно без авторизации. is_mine = 1, если создатель кометы — текущий пользователь.
     *
     * @tags Кометы
     * @name CometsList
     * @summary Список комет
     * @request GET:/comets
     */
    cometsList: (
      query?: {
        /** Период обращения от, лет */
        min_orbital_period?: number;
        /** Период обращения до, лет */
        max_orbital_period?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiCometListResponse[], ApiMessageResponse>({
        path: `/comets`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Создаёт черновик, создатель — текущий пользователь из токена. Файлы загружаются в Minio, в БД сохраняются их имена.
     *
     * @tags Кометы
     * @name CometsCreate
     * @summary Добавление кометы
     * @request POST:/comets
     * @secure
     */
    cometsCreate: (
      data: {
        /** Название кометы */
        comet_name: string;
        /**
         * Изображение: jpeg, png, webp, gif до 10 МБ
         * @format binary
         */
        comet_photo: File;
        /**
         * Видео: mp4, webm до 50 МБ
         * @format binary
         */
        comet_video: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiCometResponse, ApiMessageResponse>({
        path: `/comets`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),

    /**
     * @description Черновик текущего пользователя, id не указывается.
     *
     * @tags Кометы
     * @name DraftList
     * @summary Черновик
     * @request GET:/comets/draft
     * @secure
     */
    draftList: (params: RequestParams = {}) =>
      this.request<ApiCometResponse, ApiMessageResponse>({
        path: `/comets/draft`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Одна опубликованная комета: без id — первая, с id — по id, с next=true — следующая после id. Доступно без авторизации. is_liked = 1, если текущий пользователь лайкнул комету.
     *
     * @tags Кометы
     * @name FeedDetail
     * @summary Лента
     * @request GET:/comets/feed/{id}
     */
    feedDetail: (
      id?: number,
      query?: {
        /** true — следующая комета после id */
        next?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<ApiCometFeedResponse, ApiMessageResponse>({
        path: `/comets/feed/${id}`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Логическое удаление: статус меняется на «удалён». Только своя комета.
     *
     * @tags Кометы
     * @name CometsDelete
     * @summary Удаление кометы
     * @request DELETE:/comets/{id}
     * @secure
     */
    cometsDelete: (id: number, params: RequestParams = {}) =>
      this.request<ApiDeleteResponse, ApiMessageResponse>({
        path: `/comets/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Лайк от текущего пользователя: 1 — поставить, 0 — отменить.
     *
     * @tags Кометы
     * @name LikeCreate
     * @summary Лайк
     * @request POST:/comets/{id}/like
     * @secure
     */
    likeCreate: (
      id: number,
      like: ApiLikeRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiLikeResponse, ApiMessageResponse>({
        path: `/comets/${id}/like`,
        method: "POST",
        body: like,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Переводит свой черновик в статус «опубликован», заполняет описание и поля по теме.
     *
     * @tags Кометы
     * @name PublishUpdate
     * @summary Публикация кометы
     * @request PUT:/comets/{id}/publish
     * @secure
     */
    publishUpdate: (
      id: number,
      comet: ApiPublishCometRequest,
      params: RequestParams = {},
    ) =>
      this.request<ApiCometResponse, ApiMessageResponse>({
        path: `/comets/${id}/publish`,
        method: "PUT",
        body: comet,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * @description Проверяет логин и пароль и выдаёт JWT. Токен передаётся в заголовке Authorization: Bearer <токен>.
     *
     * @tags Пользователи
     * @name LoginCreate
     * @summary Аутентификация
     * @request POST:/users/login
     */
    loginCreate: (credentials: ApiLoginRequest, params: RequestParams = {}) =>
      this.request<ApiLoginResponse, ApiMessageResponse>({
        path: `/users/login`,
        method: "POST",
        body: credentials,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Заносит текущий JWT в чёрный список Redis до истечения срока его действия.
     *
     * @tags Пользователи
     * @name LogoutCreate
     * @summary Деавторизация
     * @request POST:/users/logout
     * @secure
     */
    logoutCreate: (params: RequestParams = {}) =>
      this.request<ApiMessageResponse, ApiMessageResponse>({
        path: `/users/logout`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Создаёт пользователя. Пароль хранится в виде bcrypt-хеша.
     *
     * @tags Пользователи
     * @name RegisterCreate
     * @summary Регистрация
     * @request POST:/users/register
     */
    registerCreate: (user: ApiRegisterRequest, params: RequestParams = {}) =>
      this.request<ApiUserResponse, ApiMessageResponse>({
        path: `/users/register`,
        method: "POST",
        body: user,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
