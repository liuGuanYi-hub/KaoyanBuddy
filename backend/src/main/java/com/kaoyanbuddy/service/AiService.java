package com.kaoyanbuddy.service;

import com.kaoyanbuddy.dto.AiChatResponse;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class AiService {

    private final ObjectProvider<ChatModel> chatModelProvider;
    private final String apiKey;
    private final String modelMode;

    public AiService(ObjectProvider<ChatModel> chatModelProvider,
                     @Value("${spring.ai.deepseek.api-key:}") String apiKey,
                     @Value("${spring.ai.model.chat:none}") String modelMode) {
        this.chatModelProvider = chatModelProvider;
        this.apiKey = apiKey;
        this.modelMode = modelMode;
    }

    public AiChatResponse chat(String message) {
        ChatModel chatModel = chatModelProvider.getIfAvailable();
        if (chatModel == null || !"deepseek".equalsIgnoreCase(modelMode) || !StringUtils.hasText(apiKey)) {
            return new AiChatResponse(fallbackAnswer(message), true);
        }

        try {
            String prompt = """
                    你是 KaoyanBuddy 的考研规划助手。请用中文回答，风格具体、务实、可执行。
                    用户问题：
                    %s
                    """.formatted(message);
            return new AiChatResponse(chatModel.call(prompt), false);
        } catch (RuntimeException ex) {
            return new AiChatResponse("DeepSeek 服务暂时不可用。你可以先把问题拆成目标、当前水平、剩余时间和卡点四部分，我会继续帮你整理复习动作。", true);
        }
    }

    private String fallbackAnswer(String message) {
        return "已收到你的问题：“" + message + "”。当前未启用 DeepSeek Key，因此先给出本地建议：把任务拆成 25-45 分钟的小块，先完成最影响分数的知识点，再用错题和真题复盘检验。配置 DEEPSEEK_API_KEY 并设置 SPRING_AI_MODEL_CHAT=deepseek 后可获得真实 AI 答复。";
    }
}
