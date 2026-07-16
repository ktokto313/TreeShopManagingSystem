package swp391.group6.model;
import java.util.HashMap;
import java.util.Map;

public class NotificationTemplate {

    private static final Map<String, String> SUBJECTS = new HashMap<>();
    private static final Map<String, String> BODIES = new HashMap<>();

    static {
        // ORDER
        register("ORDER_STATUS_UPDATE_CUSTOMER",
                "Order status update",
                "Your order #%s status changed to %s.");

        register("ORDER_DELIVERED_CUSTOMER",
                "Your order has been delivered",
                "Your order #%s has been delivered.");

        register("ORDER_DELIVERED_MANAGER",
                "Order delivered",
                "Order #%s was delivered to the customer.");

        register("DELIVERY_ASSIGNMENT_SHIPPER",
                "New delivery assignment",
                "You have been assigned to order #%s.");

        // BLOG
        register("BLOG_PENDING_APPROVAL_MANAGER",
                "New blog post pending approval",
                "\"%s\" by %s is awaiting review.");

        register("BLOG_EDIT_PENDING_APPROVAL_MANAGER",
                "Blog edit pending approval",
                "An edit to \"%s\" by %s is awaiting review.");

        register("BLOG_APPROVED_CUSTOMER",
                "Your blog post was approved",
                "\"%s\" has been approved and is now published.");

        register("BLOG_EDIT_APPROVED_CUSTOMER",
                "Your blog edit was approved",
                "Your edit to \"%s\" has been approved and is now live.");

        register("BLOG_REJECTED_CUSTOMER",
                "Your blog post was rejected",
                "\"%s\" was not approved for publishing.");

        register("BLOG_EDIT_REJECTED_CUSTOMER",
                "Your blog edit was rejected",
                "Your proposed edit to \"%s\" was not approved.");
    }

    private static void register(String key, String subject, String bodyTemplate) {
        SUBJECTS.put(key, subject);
        BODIES.put(key, bodyTemplate);
    }

    public static String subject(String key) {
        String subject = SUBJECTS.get(key);
        if (subject == null) {
            throw new IllegalArgumentException("Unknown notification template key: " + key);
        }
        return subject;
    }

    public static String body(String key, Object... args) {
        String template = BODIES.get(key);
        if (template == null) {
            throw new IllegalArgumentException("Unknown notification template key: " + key);
        }
        return String.format(template, args);
    }
}
