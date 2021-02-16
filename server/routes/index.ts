import { schema } from "@kbn/config-schema";
import {
  IRouter,
  KibanaRequest,
  KibanaResponseFactory,
  RequestHandlerContext,
} from "kibana/server";

function proxyRequest(esMethod: string) {
  return async (context: RequestHandlerContext, request: KibanaRequest<any, Object, any, any>, response: KibanaResponseFactory) => {
    try {
      const data = await context.core.elasticsearch.legacy.client.callAsCurrentUser(esMethod, {
        body: request.body,
        ...request.params,
        ...request.query,
      });
      return response.ok({
        body: data
      });
    } catch (error) {
      return response.customError({
        statusCode: error.statusCode,
        body: error.message,
      })
    }
  }
}

export function defineRoutes(router: IRouter) {

  router.post(
    {
      path: '/api/transform_vis/{index}/_search',
      validate: {
        body: schema.any(),
        params: schema.any(),
        query: schema.any(),
      }
    },
    proxyRequest('search')
  );

  router.get(
    {
      path: '/api/transform_vis/{index}/_search',
      validate: {
        params: schema.any(),
        query: schema.any(),
      }
    },
    proxyRequest('search')
  );

  router.post(
    {
      path: '/api/transform_vis/_search/scroll',
      validate: {
        body: schema.any(),
        query: schema.any(),
      }
    },
    proxyRequest('scroll')
  );

  router.delete(
    {
      path: '/api/transform_vis/_search/scroll',
      validate: {
        body: schema.any(),
        query: schema.any(),
      }
    },
    proxyRequest('scroll')
  );

}
