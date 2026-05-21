# Pot 硅基流动插件（翻译 + 文字识别）

> 全免费、无广告的高质量翻译方案。配套使用免费的 [硅基流动](https://siliconflow.cn) 大模型，翻译质量远高于谷歌机翻，支持**划词翻译**、**截图翻译（OCR）**。

[Pot](https://github.com/pot-app/pot-desktop) 是一款跨平台的划词翻译 / OCR 软件。本仓库提供两个对接硅基流动（SiliconFlow）的插件：

| 插件 | 类型 | 说明 |
| --- | --- | --- |
| `plugin.com.pot-app.siliconflow` | 翻译 | 用大模型翻译，质量优于传统机翻 |
| `plugin.com.pot-app.siliconflow_recognize` | 文字识别 (OCR) | 截图识别图片中的文字 |

两个插件均使用 **Qwen/Qwen3.5-4B**（多模态模型，可文本可识图），并默认**关闭思考模式**（`enable_thinking: false`），翻译/识别更快、直接输出结果。

## 为什么用它

- **免费**：硅基流动新用户有免费额度，Qwen3.5-4B 价格极低甚至免费，个人使用基本零成本。
- **质量高**：大模型翻译比谷歌机翻更通顺、更懂语境。
- **功能全**：划词翻译、截图 OCR 一站搞定，无广告、无弹窗。

## 安装

1. 下载本仓库的两个安装包：
   - [`plugin.com.pot-app.siliconflow.potext`](./plugin.com.pot-app.siliconflow.potext)（翻译）
   - [`plugin.com.pot-app.siliconflow_recognize.potext`](./plugin.com.pot-app.siliconflow_recognize.potext)（文字识别）
2. 打开 Pot → **设置 → 服务设置**：
   - 翻译插件：在「翻译」标签下点 **添加外部插件**，选翻译的 `.potext`
   - OCR 插件：在「文字识别」标签下点 **添加外部插件**，选识别的 `.potext`
3. 在 [硅基流动](https://cloud.siliconflow.cn/account/ak) 获取 API Key（`sk-...`），填入插件配置即可。

## 配置项

- **API Key**：你的硅基流动密钥
- **模型**：默认 `Qwen/Qwen3.5-4B`
- （OCR）**自定义 Prompt**：可选，留空使用内置识别提示词

## 说明

- 请求地址固定为 `https://api.siliconflow.cn/v1/chat/completions`。
- 已写死关闭思考模式，并对返回内容兜底剥除 `<think>...</think>`，保证只输出译文 / 识别文本。
- 速率受硅基流动账户用量级别限制（L0 默认即足够个人使用）。

## License

MIT
