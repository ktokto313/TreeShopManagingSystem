/*
 * Author: DucLM
 * Created Date: 2026-07-16
 * Name: ChatController.java
 * Description: REST controller for chat API
 */
package swp391.group6.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swp391.group6.service.rag.ChatService;
import swp391.group6.service.rag.RagService;
import swp391.group6.service.rag.DocumentIngestionService;
import jakarta.servlet.http.HttpSession;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private static final Logger log = LoggerFactory.getLogger(ChatController.class);

    private final ChatService chatService;
    private final DocumentIngestionService ingestionService;

    public ChatController(ChatService chatService, DocumentIngestionService ingestionService) {
        this.chatService = chatService;
        this.ingestionService = ingestionService;
    }

    @PostMapping
    public ResponseEntity<?> chat(@RequestBody ChatRequest request, @RequestHeader(value = "X-Session-Id", required = false) String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            sessionId = UUID.randomUUID().toString();
        }
        
        log.info("Chat request - sessionId: {}, message: {}", sessionId, request.message);
        
        try {
            ChatService.ChatResponse response = chatService.processMessage(sessionId, request.message);
            return ResponseEntity.ok(new ChatResponse(response.answer, sessionId, response.messageCount));
        } catch (Exception e) {
            log.error("Error processing chat: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to process message", "message", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(@RequestHeader("X-Session-Id") String sessionId) {
        List<RagService.ChatMessage> history = chatService.getHistory(sessionId);
        return ResponseEntity.ok(Map.of("history", history, "sessionId", sessionId));
    }

    @DeleteMapping("/history")
    public ResponseEntity<?> clearHistory(@RequestHeader("X-Session-Id") String sessionId) {
        chatService.clearHistory(sessionId);
        return ResponseEntity.ok(Map.of("message", "History cleared", "sessionId", sessionId));
    }

    @PostMapping("/ingest")
    public ResponseEntity<?> ingestDocuments() {
        log.info("Starting document ingestion...");
        try {
            ingestionService.ingestAll();
            return ResponseEntity.ok(Map.of("message", "Documents ingested successfully"));
        } catch (Exception e) {
            log.error("Error ingesting documents: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to ingest documents", "message", e.getMessage()));
        }
    }

    // Request/Response DTOs
    public static class ChatRequest {
        public String message;
    }

    public static class ChatResponse {
        public String answer;
        public String sessionId;
        public int messageCount;
        public long timestamp;

        public ChatResponse(String answer, String sessionId, int messageCount) {
            this.answer = answer;
            this.sessionId = sessionId;
            this.messageCount = messageCount;
            this.timestamp = System.currentTimeMillis();
        }
    }
}
