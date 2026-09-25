
package com.nexcart.backend.config;

import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAIConfig {

    private static final Logger log = LoggerFactory.getLogger(OpenAIConfig.class);

    @Value("${openai.api.key:}")
    private String configuredApiKey;

    @Bean
    public OpenAIClient openAIClient() {
        String key = (configuredApiKey != null && !configuredApiKey.isBlank())
                ? configuredApiKey.trim()
                : System.getenv("OPENAI_API_KEY");

        if (key != null && !key.isBlank()) {
            try {
                return OpenAIOkHttpClient.builder()
                        .apiKey(key)
                        .build();
            } catch (Exception e) {
                log.warn("Failed to initialize OpenAI client: {}", e.getMessage());
            }
        }

        log.info("OpenAI API key not configured. AIChatService will operate in intelligent fallback mode.");
        return null;
    }
}