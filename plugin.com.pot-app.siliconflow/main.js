function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function translate(text, from, to, options) {
    const { config, utils } = options;
    const { tauriFetch: fetch } = utils;

    let { apiKey, model } = config;

    if (!apiKey) {
        throw "请先配置 API Key";
    }
    if (!model) {
        model = "Qwen/Qwen3.5-4B";
    }

    const requestPath = "https://api.siliconflow.cn/v1/chat/completions";

    const systemPrompt =
        "You are a professional, authentic machine translation engine. You only return the translated text, without any extra explanation, notes, or quotation marks.";

    const userPrompt =
        from === "auto"
            ? `Translate the following text into ${to}. Output only the translation:\n\n${text}`
            : `Translate the following text from ${from} to ${to}. Output only the translation:\n\n${text}`;

    const fetchOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: {
            type: "Json",
            payload: {
                model: model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                temperature: 0,
                stream: false,
                // Qwen3 系列（Qwen3.5-4B / Qwen3-8B）统一用此参数关闭思考
                enable_thinking: false,
            },
        },
    };

    // 自动重试：硅基流动偶发 TLS 握手中断 / 网络抖动时重连，最多 3 次
    const maxRetries = 3;
    let res;
    let lastErr;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            res = await fetch(requestPath, fetchOptions);
            // 5xx 服务端错误也重试
            if (!res.ok && res.status >= 500 && attempt < maxRetries) {
                lastErr = `Http Status: ${res.status}`;
                await sleep(500 * attempt);
                continue;
            }
            break;
        } catch (e) {
            lastErr = e;
            if (attempt < maxRetries) {
                await sleep(500 * attempt);
                continue;
            }
            throw `网络请求失败（已重试 ${maxRetries} 次）：${typeof e === "string" ? e : (e && e.message) || JSON.stringify(e)}`;
        }
    }

    if (res.ok) {
        const result = res.data;
        const { choices } = result;
        if (choices && choices.length > 0) {
            let target = choices[0].message.content;
            if (typeof target !== "string") {
                throw JSON.stringify(result);
            }
            // 兜底：即便模型仍输出了 <think> 内容也剥掉
            target = target.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
            if (
                (target.startsWith('"') && target.endsWith('"')) ||
                (target.startsWith("「") && target.endsWith("」"))
            ) {
                target = target.slice(1, -1);
            }
            return target.trim();
        } else {
            throw JSON.stringify(result);
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}
