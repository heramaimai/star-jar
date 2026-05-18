export default function handler(_request, response) {
  response.status(200).json({
    ok: true,
    provider: "ark",
    model: process.env.ARK_MODEL || "",
    baseUrl: process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3",
    hasKey: Boolean(process.env.ARK_API_KEY),
  });
}
