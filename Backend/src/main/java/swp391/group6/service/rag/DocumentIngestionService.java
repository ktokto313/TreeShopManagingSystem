/*
 * Author: DucLM
 * Created Date: 2026-07-16
 * Name: DocumentIngestionService.java
 * Description: Service for ingesting documents into RAG system
 */
package swp391.group6.service.rag;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swp391.group6.model.*;
import java.util.List;

@Service
public class DocumentIngestionService {

    private static final Logger log = LoggerFactory.getLogger(DocumentIngestionService.class);

    private final RagDocumentRepository ragDocRepo;
    private final ProductRepository productRepo;
    private final BlogPostRepository blogPostRepo;
    private final FaqRepository faqRepo;
    private final EmbeddingService embeddingService;

    public DocumentIngestionService(
            RagDocumentRepository ragDocRepo,
            ProductRepository productRepo,
            BlogPostRepository blogPostRepo,
            FaqRepository faqRepo,
            EmbeddingService embeddingService) {
        this.ragDocRepo = ragDocRepo;
        this.productRepo = productRepo;
        this.blogPostRepo = blogPostRepo;
        this.faqRepo = faqRepo;
        this.embeddingService = embeddingService;
    }

    @Transactional
    public void ingestAll() {
        log.info("Starting RAG document ingestion...");
        ingestProducts();
        ingestBlogs();
        ingestFaqs();
        log.info("RAG document ingestion completed");
    }

    @Transactional
    public void ingestProducts() {
        log.info("Ingesting products...");
        List<Product> products = productRepo.findByStatusTrue();
        for (Product product : products) {
            String content = buildProductContent(product);
            String embedding = embeddingService.embedToPgVectorString(content);
            
            RagDocument doc = ragDocRepo.findBySourceTypeAndSourceId("PRODUCT", product.getId())
                    .orElse(new RagDocument());
            doc.setContent(content);
            doc.setSourceType("PRODUCT");
            doc.setSourceId(product.getId());
            doc.setTitle(product.getName());
            doc.setEmbedding(embedding);
            ragDocRepo.save(doc);
        }
        log.info("Ingested {} products", products.size());
    }

    @Transactional
    public void ingestBlogs() {
        log.info("Ingesting blogs...");
        List<BlogPost> blogs = blogPostRepo.findByStatus(swp391.group6.model.BlogStatus.PUBLISHED);
        for (BlogPost blog : blogs) {
            String content = buildBlogContent(blog);
            String embedding = embeddingService.embedToPgVectorString(content);
            
            RagDocument doc = ragDocRepo.findBySourceTypeAndSourceId("BLOG", blog.getId())
                    .orElse(new RagDocument());
            doc.setContent(content);
            doc.setSourceType("BLOG");
            doc.setSourceId(blog.getId());
            doc.setTitle(blog.getTitle());
            doc.setEmbedding(embedding);
            ragDocRepo.save(doc);
        }
        log.info("Ingested {} blogs", blogs.size());
    }

    @Transactional
    public void ingestFaqs() {
        log.info("Ingesting FAQs...");
        List<Faq> faqs = faqRepo.findAll();
        for (Faq faq : faqs) {
            String content = "Question: " + faq.getQuestion() + "\nAnswer: " + faq.getAnswer();
            String embedding = embeddingService.embedToPgVectorString(content);
            
            RagDocument doc = ragDocRepo.findBySourceTypeAndSourceId("FAQ", faq.getId())
                    .orElse(new RagDocument());
            doc.setContent(content);
            doc.setSourceType("FAQ");
            doc.setSourceId(faq.getId());
            doc.setTitle(faq.getQuestion());
            doc.setEmbedding(embedding);
            ragDocRepo.save(doc);
        }
        log.info("Ingested {} FAQs", faqs.size());
    }

    private String buildProductContent(Product product) {
        StringBuilder sb = new StringBuilder();
        sb.append("Product: ").append(product.getName()).append("\n");
        sb.append("Price: ").append(product.getPrice()).append(" VND\n");
        sb.append("Category: ").append(product.getCategory().getName()).append("\n");
        if (product.getProductDetail() != null) {
            sb.append("Description: ").append(product.getProductDetail().getDescription()).append("\n");
            sb.append("Care instructions: ").append(product.getProductDetail().getCareInstructions()).append("\n");
        }
        sb.append("Status: ").append(product.isStatus() ? "Available" : "Unavailable");
        return sb.toString();
    }

    private String buildBlogContent(BlogPost blog) {
        StringBuilder sb = new StringBuilder();
        sb.append("Blog Title: ").append(blog.getTitle()).append("\n");
        sb.append("Content: ").append(blog.getContent());
        return sb.toString();
    }
}
