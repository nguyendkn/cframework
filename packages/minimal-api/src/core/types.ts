import { HttpContext } from "@core/http";

/**
 * Endpoint handler types
 */
export type EndpointHandler = (context: HttpContext) => Promise<any>;
export type EndpointMiddleware = (
  context: HttpContext,
  next: () => Promise<void>
) => Promise<void>;

/**
 * HTTP method types
 */
export enum HttpMethod {
  GET = "get",
  POST = "post",
  PUT = "put",
  DELETE = "delete",
  PATCH = "patch",
  OPTIONS = "options",
  HEAD = "head",
}

/**
 * Route definition
 */
export interface RouteDefinition {
  path: string;
  method: HttpMethod;
  handler: EndpointHandler;
  middlewares: EndpointMiddleware[];
}

/**
 * Endpoint metadata
 */
export interface EndpointMetadata {
  routes: RouteDefinition[];
}

/**
 * Result types
 */
export interface IResult {
  execute(context: HttpContext): Promise<void>;
}

/**
 * JSON result
 */
export class JsonResult implements IResult {
  constructor(
    private readonly data: any,
    private readonly statusCode: number = 200
  ) {}

  public async execute(context: HttpContext): Promise<void> {
    context.response.status(this.statusCode).json(this.data);
  }
}

/**
 * No content result
 */
export class NoContentResult implements IResult {
  constructor(private readonly statusCode: number = 204) {}

  public async execute(context: HttpContext): Promise<void> {
    context.response.status(this.statusCode).end();
  }
}

/**
 * Redirect result
 */
export class RedirectResult implements IResult {
  constructor(
    private readonly url: string,
    private readonly permanent: boolean = false
  ) {}

  public async execute(context: HttpContext): Promise<void> {
    context.response.redirect(this.permanent ? 301 : 302, this.url);
  }
}

/**
 * File result
 */
export class FileResult implements IResult {
  constructor(
    private readonly path: string,
    private readonly fileName?: string
  ) {}

  public async execute(context: HttpContext): Promise<void> {
    if (this.fileName) {
      context.response.download(this.path, this.fileName);
    } else {
      context.response.sendFile(this.path);
    }
  }
}
