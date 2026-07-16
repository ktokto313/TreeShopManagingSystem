/*
 * Author: DucLM
 * Created Date: 2026-07-16
 * Name: RagService.java
 * Description: Service for RAG retrieval and answer generation
 */
package swp391.group6.service.rag;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import swp391.group6.model.RagDocument;
import swp391.group6.repository.RagDocumentRepository;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RagService {

    private static final Logger log = LoggerFactory.getLogger(RagService.class);

    private final RagDocumentRepository ragDocRepo;
    private final EmbeddingService embeddingService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${spring.ai.gemini.api-key}")
    private String apiKey;

    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=";
    private static final int TOP_K = 5;

    public RagService(RagDocumentRepository ragDocRepo, EmbeddingService embeddingService,
                      RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.ragDocRepo = ragDocRepo;
        this.embeddingService = embeddingService;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public String generateAnswer(String userQuery, List<ChatMessage> conversationHistory) {
        // 1. Retrieve relevant documents
        String queryEmbedding = embeddingService.embedToPgVectorString(userQuery);
        List<RagDocument> relevantDocs = ragDocRepo.findSimilarDocuments(queryEmbedding, TOP_K);
        
        log.info("Found {} relevant documents for query: {}", relevantDocs.size(), userQuery);

        // 2. Build context from retrieved documents
        String context = relevantDocs.stream()
                .map(doc -> String.format("[%s] %s", doc.getSourceType(), doc.getContent()))
                .collect(Collectors.joining("\n\n"));

        // 3. Build prompt with context
        String prompt = buildPrompt(userQuery, context, conversationHistory);

        // 4. Call Gemini API
        return callGeminiApi(prompt);
    }

    private String buildPrompt(String userQuery, String context, List<ChatMessage> history) {
        StringBuilder systemPrompt = new StringBuilder();
        systemPrompt.append("Bạn là trợ lý AI của cửa hàng cây cảnh TreeShop. ");
        systemPrompt.append("Nhiệm vụ của bạn là tư vấn khách hàng về các loại cây cảnh, ");
        systemPrompt.append("chăm sóc cây, và hỗ trợ mua hàng.\n\n");
        systemPrompt.append("Nguyên tắc:\n");
        systemPrompt.append("1. Trả lời ngắn gọn, thân thiện, bằng tiếng Việt\n");
        systemPrompt.append("2. Chỉ sử dụng thông tin được cung cấp trong context\n");
        systemPrompt.append("3. Nếu không có thông tin phù hợp, hãy nói 'Tôi không tìm thấy thông tin chính xác về điều này'\n");
        systemPrompt.append("4. Không bịa đặt thông tin\n\n");
        systemPrompt.append("Context:\n").append(context);

        StringBuilder fullPrompt = new StringBuilder();
        fullPrompt.append(systemPrompt).append("\n\n");
        
        // Add conversation history
        for (ChatMessage msg : history) {
            fullPrompt.append(msg.role.equals("user") ? "Khách hàng: " : "Trợ lý: ");
            fullPrompt.append(msg.content).append("\n");
        }
        
        fullPrompt.append("Khách hàng: ").append(userQuery).append("\n");
        fullPrompt.append("Trợ lý:");

        return fullPrompt.toString();
    }

    private String callGeminiApi(String prompt) {
        try {
            String url = GEMINI_URL + apiKey;
            
            String requestBody = """
                {
                    "contents": [{
                        "parts": [{"text": %s}]
                    }],
                    "generationConfig": {
                        "temperature": 0.7,
                        "maxOutputTokens": 1000
                    }
                }
                """.formatted("\"" + prompt.replace("\"", "\\\"").replace("\n", "\\n") + "\"");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.POST, entity, String.class
            );

            JsonNode root = objectMapper.readTree(response.getBody());
            String answer = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();
            
            return answer;
        } catch (Exception e) {
            log.error("Error calling Gemini API: {}", e.getMessage());
            return "Xin lỗi, tôi đang gặp sự cố khi xử lý yêu cầu của bạn.";
        }
    }

    // DTO for chat messages
    public static class ChatMessage {
        public String role;
        public String content;
        
        public ChatMessage() {}
        
        public ChatMessage(String role, String content) {
            this.role = role;
            this.content = content;
        }
    }
}
