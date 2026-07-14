/*
 * Author: AnhLV
 * Created Date: 2026-06-08
 * Name: TicketRequest.java
 * Description: Data Transfer Object (DTO) for encapsulating ticket request data.
 * Last Change Author: AnhLV
 * Last Change Date: 2026-06-08
 */
package swp391.group6.dto;

public class TicketRequest {
    private String title;
    private String detail;
    private String ticketType;
    private String priority;
    private long creatorId;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDetail() {
        return detail;
    }

    public void setDetail(String detail) {
        this.detail = detail;
    }

    public String getTicketType() {
        return ticketType;
    }

    public void setTicketType(String ticketType) {
        this.ticketType = ticketType;
    }

    public String getPriority() {
        return priority;
    }

    public void setPriority(String priority) {
        this.priority = priority;
    }

    public long getCreatorId() {
        return creatorId;
    }

    public void setCreatorId(long creatorId) {
        this.creatorId = creatorId;
    }
}