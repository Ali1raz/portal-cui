import { UrlObject } from "url";

export type ApiResponseType = {
  status: "error" | "success";
  message: string;
};

export type URL = UrlObject | __next_route_internal_types__.RouteImpl<string>;
