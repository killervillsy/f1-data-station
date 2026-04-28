import { fetchF1News } from "@/lib/news-api";

export async function GET() {
  const result = await fetchF1News();

  return Response.json(result, {
    status: result.ok ? 200 : 503,
  });
}
