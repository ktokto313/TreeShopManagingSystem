/*
 * Author: DucLM
 * Created Date: 2026-07-16
 * Name: ChatService.java
 * Description: Service for managing chat conversations
 */
package swp391.group6.service.rag;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);
    private static final int MAX_HISTORY = 10;

    private final RagService ragService;
    
    // In-memory conversation history (in production, use Redis or database)
    private final Map<String, List<RagService.ChatMessage>> conversations = new ConcurrentHashMap<>();

    public ChatService(RagService ragService) {
        this.ragService = ragService;
    }

    public ChatResponse processMessage(String sessionId, String userMessage) {
        log.info("Processing chat message for session: {}", sessionId);
        
        // Get or create conversation history
        List<RagService.ChatMessage> history = conversations.computeIfAbsent(
            sessionId, k -> new ArrayList<>()
        );

        // Add user message to history
        history.add(new RagService.ChatMessage("user", userMessage));

        // Limit history size
        if (history.size() > MAX_HISTORY * 2) {
            history = history.subList(history.size() - MAX_HISTORY * 2, history.size());
            conversations.put(sessionId, history);
        }

        // Generate response using RAG
        String answer = ragService.generateAnswer(userMessage, history);

        // Add assistant response to history
        history.add(new RagService.ChatMessage("assistant", answer));

        return new ChatResponse(answer, history.size() / 2);
    }

    public List<RagService.ChatMessage> getHistory(String sessionId) {
        return conversations.getOrDefault(sessionId, Collections.emptyList());
    }

    public void clearHistory(String sessionId) {
        conversations.remove(sessionId);
        log.info("Cleared conversation history for session: {}", sessionId);
    }

    // Response DTO
    public static class ChatResponse {
        public String answer;
        public int messageCount;
        public long timestamp;

        public ChatResponse(String answer, int messageCount) {
            this.answer = answer;
            this.messageCount = messageCount;
            this.timestamp = System.currentTimeMillis();
        }
    }
}
