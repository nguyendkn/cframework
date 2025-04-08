/**
 * Route interface
 */
export interface Route {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';
  handler: (req: any, res: any) => Promise<any>;
}

/**
 * Route collection
 */
export class RouteCollection {
  private _routes: Route[] = [];

  /**
   * Add a route
   */
  public addRoute(route: Route): void {
    this._routes.push(route);
  }

  /**
   * Get all routes
   */
  public getRoutes(): Route[] {
    return this._routes;
  }
}
