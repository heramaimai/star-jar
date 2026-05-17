import http from "node:http";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env");

if (existsSync(envPath)) {
  const envText = readFileSync(envPath, "utf8");
  envText.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!match || process.env[match[1]]) return;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  });
}

const port = Number(process.env.CHAT_API_PORT || 8787);
const provider = "ark";
const model = process.env.ARK_MODEL || "请在 .env 里填写 ARK_MODEL";
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

const readJson = (request) =>
  new Promise((resolveJson, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Request body too large"));
      }
    });
    request.on("end", () => {
      try {
        resolveJson(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });

const sendJson = (response, status, payload) => {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  });
  response.end(JSON.stringify(payload));
};

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

const server = http.createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.url === "/health") {
    sendJson(response, 200, {
      ok: true,
      provider,
      model,
      baseUrl,
      hasKey: Boolean(apiKey),
    });
    return;
  }

  if (request.url !== "/api/chat" || request.method !== "POST") {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  if (!apiKey || !model || model.startsWith("请在")) {
    sendJson(response, 200, {
      fallback: true,
      reply: "我在这里。你可以慢慢说，这一刻不用急着整理好。",
      missingConfig: !apiKey ? "ARK_API_KEY" : "ARK_MODEL",
    });
    return;
  }

  try {
    const { messages = [], message = "" } = await readJson(request);
    const cleanMessage = String(message).trim().slice(0, 800);

    if (!cleanMessage) {
      sendJson(response, 400, { error: "Message is required" });
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
      sendJson(response, apiResponse.status, {
        error: data.error?.message || data.message || "Doubao API request failed",
      });
      return;
    }

    sendJson(response, 200, {
      fallback: false,
      reply: extractText(data) || "我听见了。我们可以先把这句话放在这里。",
    });
  } catch (error) {
    sendJson(response, 500, {
      error: error.message || "Chat server error",
    });
  }
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Star Jar chat API running on http://0.0.0.0:${port}`);
});
