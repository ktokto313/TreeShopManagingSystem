/*
 * Author: Hung Dao
 * Created Date: 2026-07-16
 * Name: NotificationTemplate.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-16
 */
package swp391.group6.model;

import java.util.HashMap;
import java.util.Map;

public class NotificationTemplate {

    private static final Map<String, String> SUBJECTS = new HashMap<>();
    private static final Map<String, String> BODIES = new HashMap<>();

    static {

        //ORDER
        register("ORDER_PLACED_CUSTOMER",
                 "Order placed successfully",
                 "Đơn hàng #%s của bạn đã được tạo thành công.");

        register("NEW_ORDER_MANAGER",
                 "New order",
                 "Có đơn hàng mới #%s cần được xử lý.");

        register("ORDER_STATUS_UPDATE_CUSTOMER",
                "Order status update",
                "Đơn hàng #%s của bạn đã đổi trạng thái thành %s.");

        register("ORDER_DELIVERED_CUSTOMER",
                "Your order has been delivered",
                "Đơn hàng #%s của bạn đã đến nơi.");

        register("ORDER_DELIVERED_MANAGER",
                "Order delivered",
                "Đơn hàng #%s đã được giao.");

        register("DELIVERY_ASSIGNMENT_SHIPPER",
                "New delivery assignment",
                "Bạn được giao đơn hàng #%s.");

        register("DELIVERY_STARTED_SHIPPER",
                "Delivery started",
                "Đã đến lúc giao đơn hàng #%s.");

        register("DELIVERY_ISSUE_MANAGER",
                "Delivery issue",
                "Đơn hàng #%s đã gặp vấn đề trong lúc vận chuyển.");

        //BLOG
        register("BLOG_PENDING_APPROVAL_MANAGER",
                "New blog post pending approval",
                "\"%s\" bởi %s đang đợi duyệt.");

        register("BLOG_EDIT_PENDING_APPROVAL_MANAGER",
                "Blog edit pending approval",
                "Một bản cập nhật của bài viết \"%s\" của %s đang đợi duyệt.");

        register("BLOG_APPROVED_CUSTOMER",
                "Your blog post was approved",
                "\"%s\" đã được duyệt và công khai.");

        register("BLOG_EDIT_APPROVED_CUSTOMER",
                "Your blog edit was approved",
                "Cập nhật cho \"%s\" đã được duyệt.");

        register("BLOG_REJECTED_CUSTOMER",
                "Your blog post was rejected",
                "\"%s\" bị từ chối.");

        register("BLOG_EDIT_REJECTED_CUSTOMER",
                "Your blog edit was rejected",
                "Cập nhật cho \"%s\" không được duyệt.");

        register("BLOG_DELETED_CUSTOMER",
                "Your blog post was removed",
                "\"%s\" đã được xóa bởi quản lý.");

        //TICKET
        register("NEW_SUPPORT_REQUEST_AGENT",
                "New support request",
                "Phiếu yêu cầu hỗ trợ \"%s\" tạo bởi %s.");

        register("TICKET_RESOLVED_CUSTOMER",
                "Your ticket has been resolved",
                "Phiếu yêu cầu hỗ trợ \"%s\" của bạn đã được xử lý.");

        register("TICKET_PROCESSING_CUSTOMER",
                "Your ticket is being processed",
                "Phiếu yêu cầu hỗ trợ \"%s\" của bạn đang được xử lý.");

        register("TICKET_REOPENED_AGENT",
                "Ticket reopened",
                "Khách hàng yêu cầu xem xét thêm cho phiếu yêu cầu hỗ trợ \"%s\".");
    }

    private static void register(String key, String subject, String bodyTemplate) {
        SUBJECTS.put(key, subject);
        BODIES.put(key, bodyTemplate);
    }

    public static String subject(String key) {
        String subject = SUBJECTS.get(key);
        if (subject == null) {
            throw new IllegalArgumentException("Không xác định: " + key);
        }
        return subject;
    }

    public static String body(String key, Object... args) {
        String template = BODIES.get(key);
        if (template == null) {
            throw new IllegalArgumentException("Không xác định: " + key);
        }
        return String.format(template, args);
    }
}
