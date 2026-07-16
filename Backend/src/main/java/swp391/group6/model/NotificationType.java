/*
 * Author: Hung Dao
 * Created Date: 2026-07-16
 * Name: NotificationType.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-16
 */
package swp391.group6.model;

public enum NotificationType {
    // Customer
    ORDER_CONFIRMATION,
    ORDER_STATUS_UPDATE,
    DELIVERY_COMPLETED,
    SUPPORT_TICKET_RESOLVED,
    BLOG_STATUS_UPDATE,
    OTP_VERIFICATION,

    // Manager
    NEW_ORDER_ALERT,
    LOW_STOCK_ALERT,
    BLOG_PENDING_APPROVAL,

    // Shipper
    DELIVERY_ASSIGNMENT,

    // Customer Support
    DELIVERY_EXCEPTION,
    NEW_SUPPORT_REQUEST,

    // System Admin
    SECURITY_ALERT,
    SYSTEM_CONFIG_CHANGE
}
