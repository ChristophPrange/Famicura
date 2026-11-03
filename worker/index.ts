import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";

// Die Anmeldung vertraut den oai-authenticated-*-Headern, die nur OpenAI Sites sicher setzt.
// Auf jeder anderen Plattform (z. B. eigenes Cloudflare-Konto) könnte sie jeder fälschen.
// Deshalb werden sie verworfen, außer TRUSTED_IDENTITY_HEADERS ist ausdrücklich auf "1" gesetzt.
// Ohne die Header läuft nur die Demo, eine Anmeldung ist dann nicht möglich.
function withoutUntrustedIdentity(request: Request, env: Cloudflare.Env) {
  if ((env as { TRUSTED_IDENTITY_HEADERS?: string }).TRUSTED_IDENTITY_HEADERS === "1") return request;
  const names = [...request.headers.keys()].filter((name) => name.toLowerCase().startsWith("oai-authenticated-"));
  if (!names.length) return request;
  const headers = new Headers(request.headers);
  for (const name of names) headers.delete(name);
  return new Request(request, { headers });
}

const worker = {
  fetch(rawRequest: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    const request = withoutUntrustedIdentity(rawRequest, env);
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    return runWithConnectorBinding(binding, () => handler.fetch(request, env, ctx));
  },
};

export default worker;
