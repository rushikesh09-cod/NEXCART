
package com.nexcart.backend.controller;

import com.nexcart.backend.service.AIChatService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    private final AIChatService aiChatService;

    public ChatController(AIChatService aiChatService) {
        this.aiChatService = aiChatService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(
            @Valid @RequestBody ChatRequest request) {

        String response = aiChatService.getAIResponse(request.message());

        return ResponseEntity.ok(new ChatResponse(response));
    }

    public record ChatRequest(
            @NotBlank(message = "Message cannot be empty")
            String message
    ) {}

    public record ChatResponse(String response) {}
}