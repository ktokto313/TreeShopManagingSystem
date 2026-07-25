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

    //CUSTOMER
    ORDER_CONFIRMATION,
    ORDER_STATUS_UPDATE,
    DELIVERY_COMPLETED,
    SUPPORT_TICKET_RESOLVED,
    BLOG_STATUS_UPDATE,
    SUPPORT_TICKET_UPDATE,
    WISHLIST_PRODUCT_BACK_IN_STOCK,

    //MANAGER
    NEW_ORDER_ALERT,
    BLOG_PENDING_APPROVAL,

    //SHIPPER
    DELIVERY_ASSIGNMENT,

    //SUPPORT
    NEW_SUPPORT_REQUEST,

    //SYSTEM
    DELIVERY_EXCEPTION
}