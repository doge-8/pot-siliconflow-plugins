async function recognize(base64, lang, options) {
    const { config, utils } = options;
    const { tauriFetch: fetch } = utils;

    let { apiKey, model, customPrompt } = config;

    if (!apiKey) {
        throw "请先配置 API Key";
    }
    if (!model) {
        model = "Qwen/Qwen3.5-4B";
    }

    const requestPath = "https://api.siliconflow.cn/v1/chat/completions";

    let prompt =
        customPrompt && customPrompt.trim() !== ""
            ? customPrompt
            : "Recognize all the text in the image exactly as it appears. Output only the recognized text, without any explanation, translation, comments, or quotation marks.";

    if (lang && lang !== "auto" && lang !== "Auto") {
        prompt += ` The text in the image is mainly in ${lang}.`;
    }

    const res = await fetch(requestPath, {
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
                    {
                        role: "user",
                        content: [
                            { type: "text", text: prompt },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/png;base64,${base64}`,
                                    detail: "high",
                                },
                            },
                        ],
                    },
                ],
                temperature: 0,
                stream: false,
                // Qwen3.5-4B 关闭思考模式
                enable_thinking: false,
            },
        },
    });

    if (res.ok) {
        const result = res.data;
        const { choices } = result;
        if (choices && choices.length > 0) {
            let target = choices[0].message.content;
            if (typeof target !== "string") {
                throw JSON.stringify(result);
            }
            // 兜底：剥掉可能残留的 <think> 内容
            target = target.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
            return target;
        } else {
            throw JSON.stringify(result);
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}
