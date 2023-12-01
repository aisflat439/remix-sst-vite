import {
  StackContext,
  Api,
  EventBus,
  StaticSite as RemixSite,
} from "sst/constructs";

export function API({ stack }: StackContext) {
  const bus = new EventBus(stack, "bus", {
    defaults: {
      retries: 10,
    },
  });

  const api = new Api(stack, "api", {
    defaults: {
      function: {
        bind: [bus],
      },
    },
    routes: {
      "GET /": "packages/functions/src/lambda.handler",
      "GET /todo": "packages/functions/src/todo.list",
      "POST /todo": "packages/functions/src/todo.create",
    },
  });

  const frontend = new RemixSite(stack, "frontend", {
    path: "packages/frontend",
    environment: {
      VITE_APP_API_URL: api.url,
    },
  });

  bus.subscribe("todo.created", {
    handler: "packages/functions/src/events/todo-created.handler",
  });

  stack.addOutputs({
    ApiEndpoint: api.url,
    FrontendUrl: frontend.url || "http://localhost:5173",
  });
}
