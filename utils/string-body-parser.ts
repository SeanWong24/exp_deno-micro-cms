export const STRING_BODY_PARSER = async (body: ReadableStream) =>
  await new Response(body).text();
