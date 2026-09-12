export function withErrors(
  handler: (req: Request) => Promise<Response>,
): (req: Request) => Promise<Response> {
  return async function (req: Request): Promise<Response> {
    try {
      return await handler(req);
    } catch (err) {
      console.error("API handler error:", err);
      return Response.json(
        { error: err instanceof Error ? err.message : "Unexpected server error" },
        { status: 500 },
      );
    }
  };
}