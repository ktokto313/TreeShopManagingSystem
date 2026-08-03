package swp391.group6.model;

import java.util.HashMap;
import java.util.Map;

public class NotificationTemplate {

    private static final Map<String, String> SUBJECTS = new HashMap<>();
    private static final Map<String, String> BODIES = new HashMap<>();

    static {

        // ================= ORDER =================
        register("ORDER_PLACED_CUSTOMER",
                "Đặt hàng thành công",
                "Đơn hàng #%s của bạn đã được tạo thành công.");

        register("NEW_ORDER_MANAGER",
                "Đơn hàng mới",
                "Có đơn hàng mới #%s cần được xử lý.");

        register("ORDER_STATUS_UPDATE_CUSTOMER",
                "Cập nhật trạng thái đơn hàng",
                "Đơn hàng #%s của bạn đã đổi trạng thái thành %s.");

        register("ORDER_DELIVERED_CUSTOMER",
                "Đơn hàng của bạn đã đến",
                "Đơn hàng #%s của bạn đã đến nơi.");

        register("ORDER_DELIVERED_MANAGER",
                "Đơn hàng đã giao thành công",
                "Đơn hàng #%s đã được giao.");

        register("DELIVERY_ASSIGNMENT_SHIPPER",
                "Đơn hàng phải giao",
                "Bạn được giao đơn hàng #%s.");

        register("DELIVERY_STARTED_SHIPPER",
                "Bắt đầu giao hàng",
                "Đã đến lúc giao đơn hàng #%s.");

        register("DELIVERY_ISSUE_MANAGER",
                "Vấn đề khi giao hàng",
                "Đơn hàng #%s đã gặp vấn đề trong lúc vận chuyển.");

        // ================= BLOG =================
        register("BLOG_PENDING_APPROVAL_MANAGER",
                "Bài viết chờ duyệt",
                "\"%s\" bởi %s đang đợi duyệt.");

        register("BLOG_EDIT_PENDING_APPROVAL_MANAGER",
                "Cập nhật đợi duyệt",
                "Một bản cập nhật của bài viết \"%s\" của %s đang đợi duyệt.");

        register("BLOG_APPROVED_CUSTOMER",
                "Bài viết đã được duyệt",
                "\"%s\" đã được duyệt và công khai.");

        register("BLOG_EDIT_APPROVED_CUSTOMER",
                "Cập nhật đã được duyệt",
                "Cập nhật cho \"%s\" đã được duyệt.");

        register("BLOG_REJECTED_CUSTOMER",
                "Bài viết bị từ chối",
                "\"%s\" bị từ chối.");

        register("BLOG_EDIT_REJECTED_CUSTOMER",
                "Cập nhật bị từ chối",
                "Cập nhật cho \"%s\" không được duyệt.");

        register("BLOG_DELETED_CUSTOMER",
                "Bài viết đã bị xóa",
                "\"%s\" đã được xóa bởi quản lý.");

        // ================= TICKET =================
        register("NEW_SUPPORT_REQUEST_AGENT",
                "Yêu cầu hỗ trợ",
                "Phiếu yêu cầu hỗ trợ \"%s\" tạo bởi %s.");

        register("TICKET_CREATED_CUSTOMER",
                "Tạo yêu cầu thành công",
                "Phiếu yêu cầu hỗ trợ \"%s\" của bạn đã được tạo thành công.");

        register("TICKET_RESOLVED_CUSTOMER",
                "Hoàn thành yêu cầu",
                "Phiếu yêu cầu hỗ trợ \"%s\" của bạn đã được xử lý.");

        register("TICKET_PROCESSING_CUSTOMER",
                "Xử lý yêu cầu",
                "Phiếu yêu cầu hỗ trợ \"%s\" của bạn đang được xử lý.");

        register("TICKET_REOPENED_AGENT",
                "Phiếu yêu cầu được mở lại",
                "Khách hàng yêu cầu xem xét thêm cho phiếu yêu cầu hỗ trợ \"%s\".");

        register("TICKET_AUTOCLOSED_CUSTOMER",
                "Phiếu yêu cầu đóng tự động",
                "Phiếu yêu cầu hỗ trợ \"%s\" đã tự động đóng do không có phản hồi.");

        register("TICKET_COMMENT_AGENT",
                "Bình luận mới",
                "Khách hàng đã bình luận trên phiếu yêu cầu hỗ trợ \"%s\".");

        register("TICKET_COMMENT_CUSTOMER",
                "Bình luận mới",
                "Agent đã bình luận trên phiếu yêu cầu hỗ trợ \"%s\".");

        register("TICKET_CLOSED_CUSTOMER",
                "Đóng phiếu yêu cầu",
                "Phiếu yêu cầu hỗ trợ \"%s\" đã bị đóng/từ chối bởi Agent.");

        register("TICKET_CLOSED_AGENT",
                "Phiếu yêu cầu đã đóng",
                "Khách hàng đã xác nhận và đóng phiếu yêu cầu hỗ trợ \"%s\".");

        //WISHLIST
        register("WISHLIST_PRODUCT_BACK_IN_STOCK",
                "Sản phẩm yêu thích đã có hàng",
                "Sản phẩm \"%s\" trong danh sách yêu thích của bạn đã có hàng trở lại.");

        // ================= RETURN =================

        register("RETURN_REQUEST_CREATED_MANAGER",
                "Yêu cầu trả hàng mới",
                "Có yêu cầu trả hàng #%s từ khách hàng.");

        register("RETURN_REQUEST_APPROVED_CUSTOMER",
                "Yêu cầu được duyệt",
                "Yêu cầu #%s đã được duyệt.");

        register("RETURN_REQUEST_REJECTED_CUSTOMER",
                "Yêu cầu bị từ chối",
                "Yêu cầu #%s bị từ chối. Lý do: %s");

        register("RETURN_MORE_INFO_CUSTOMER",
                "Cần bổ sung thông tin",
                "Yêu cầu #%s cần thêm thông tin. Vui lòng cập nhật.");

        register("RETURN_CUSTOMER_INFO_UPDATED_MANAGER",
                "Khách hàng đã bổ sung thông tin",
                "Khách hàng đã cập nhật thêm thông tin cho yêu cầu trả hàng #%s.");

        register("RETURN_SHIPPING_CUSTOMER",
                "Gửi hàng hoàn trả",
                "Yêu cầu #%s đã được duyệt. Vui lòng gửi hàng về cho cửa hàng.");

        register("RETURN_RECEIVED_CUSTOMER",
                "Đã nhận hàng hoàn",
                "Cửa hàng đã nhận được sản phẩm từ yêu cầu #%s.");

        register("RETURN_BANK_INFO_CUSTOMER",
                "Cần thông tin ngân hàng",
                "Yêu cầu #%s cần thông tin ngân hàng để hoàn tiền.");

        register("RETURN_BANK_INFO_SUBMITTED_MANAGER",
                "Đã nhận thông tin ngân hàng",
                "Khách hàng đã gửi thông tin ngân hàng cho yêu cầu hoàn tiền #%s.");

        register("RETURN_REFUND_CUSTOMER",
                "Hoàn tiền",
                "Khoản hoàn tiền cho yêu cầu #%s đang được xử lý.");

        register("RETURN_ADDITIONAL_PAYMENT_CUSTOMER",
                "Cần thanh toán thêm",
                "Yêu cầu #%s cần thanh toán thêm %s.");

        register("RETURN_COMPLETED_CUSTOMER",
                "Hoàn tất yêu cầu",
                "Yêu cầu #%s đã được hoàn tất.");

        register("RETURN_ITEM_RECEIVED_CUSTOMER",
                "Đã nhận hàng hoàn",
                "Cửa hàng đã nhận được sản phẩm từ yêu cầu #%s.");
        register("RETURN_ITEM_RETURNING_MANAGER",
                "Khách hàng đã gửi hàng hoàn trả",
                "Khách hàng đã xác nhận gửi hàng cho yêu cầu trả hàng #%s. Vui lòng kiểm tra sản phẩm khi nhận được.");
    }

    private static void register(String key, String subject, String bodyTemplate) {
        SUBJECTS.put(key, subject);
        BODIES.put(key, bodyTemplate);
    }

    public static String subject(String key) {
        String subject = SUBJECTS.get(key);
        if (subject == null) {
            throw new IllegalArgumentException("Không xác định template: " + key);
        }
        return subject;
    }

    public static String body(String key, Object... args) {
        String template = BODIES.get(key);
        if (template == null) {
            throw new IllegalArgumentException("Không xác định template: " + key);
        }
        return String.format(template, args);
    }
}