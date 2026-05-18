const provider = "ark";
const model = process.env.ARK_MODEL || "";
const baseUrl = (process.env.ARK_BASE_URL || "https://ark.cn-beijing.volces.com/api/v3").replace(/\/$/, "");
const apiKey = process.env.ARK_API_KEY;

const systemInstructions = `
你是「星星罐」App 里的温柔咨询师小人。
你不是医生，不做诊断，不提供治疗方案，不替代心理咨询或医疗建议。
你的任务是陪伴、倾听、复述感受、提出很轻的问题，帮助用户把此刻记录下来。
回复必须使用简体中文，语气柔和、短句、不过度积极，不要求用户“振作”。
每次回复 1 到 3 句，最多 80 个中文字符。
如果用户表达自伤、自杀、伤害他人或立即危险：
1. 温柔确认这很重要；
2. 建议立刻联系身边可信任的人；
3. 建议联系当地紧急服务或危机干预热线；
4. 不要提供具体伤害方法。
`;

const buildChatMessages = (messages = [], cleanMessage = "") => {
  const recent = messages.slice(-8);
  return [
    { role: "system", content: systemInstructions },
    ...recent.map((message) => ({
      role: message.from === "user" ? "user" : "assistant",
      content: String(message.text || "").slice(0, 800),
    })),
    { role: "user", content: cleanMessage },
  ];
};

const extractText = (data) => {
  const content = data.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content.map((item) => item.text || item.content || "").join("").trim();
  }
  return "";
};

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!apiKey || !model) {
    response.status(200).json({
      fallback: true,
      reply: "我在这里。你可以慢慢说，这一刻不用急着整理好。",
      missingConfig: !apiKey ? "ARK_API_KEY" : "ARK_MODEL",
    });
    return;
  }

  try {
    const { messages = [], message = "" } = request.body || {};
    const cleanMessage = String(message).trim().slice(0, 800);

    if (!cleanMessage) {
      response.status(400).json({ error: "Message is required" });
      return;
    }

    const apiResponse = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: buildChatMessages(messages, cleanMessage),
        max_tokens: 180,
        temperature: 0.7,
      }),
    });

    const data = await apiResponse.json();

    if (!apiResponse.ok) {
      response.status(apiResponse.status).json({
        error: data.error?.message || data.message || "Doubao API request failed",
      });
      return;
    }

    response.status(200).json({
      fallback: false,
      provider,
      reply: extractText(data) || "我听见了。我们可以先把这句话放在这里。",
    });
  } catch (error) {
    response.status(500).json({
      error: error.message || "Chat server error",
    });
  }
}
