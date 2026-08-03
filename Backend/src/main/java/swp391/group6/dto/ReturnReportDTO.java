package swp391.group6.dto;

import java.math.BigDecimal;

public class ReturnReportDTO {

    private long totalRequests;

    private long completedReturns;

    private long rejectedRequests;

    private BigDecimal totalRefundAmount;

    private BigDecimal totalAdditionalPayment;

    private BigDecimal revenueImpact;


    public ReturnReportDTO() {
    }


    public ReturnReportDTO(
            long totalRequests,
            long completedReturns,
            long rejectedRequests,
            BigDecimal totalRefundAmount,
            BigDecimal totalAdditionalPayment,
            BigDecimal revenueImpact
    ) {
        this.totalRequests = totalRequests;
        this.completedReturns = completedReturns;
        this.rejectedRequests = rejectedRequests;
        this.totalRefundAmount = totalRefundAmount;
        this.totalAdditionalPayment = totalAdditionalPayment;
        this.revenueImpact = revenueImpact;
    }


    public long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(long totalRequests) {
        this.totalRequests = totalRequests;
    }


    public long getCompletedReturns() {
        return completedReturns;
    }

    public void setCompletedReturns(long completedReturns) {
        this.completedReturns = completedReturns;
    }


    public long getRejectedRequests() {
        return rejectedRequests;
    }

    public void setRejectedRequests(long rejectedRequests) {
        this.rejectedRequests = rejectedRequests;
    }


    public BigDecimal getTotalRefundAmount() {
        return totalRefundAmount;
    }

    public void setTotalRefundAmount(BigDecimal totalRefundAmount) {
        this.totalRefundAmount = totalRefundAmount;
    }


    public BigDecimal getTotalAdditionalPayment() {
        return totalAdditionalPayment;
    }

    public void setTotalAdditionalPayment(BigDecimal totalAdditionalPayment) {
        this.totalAdditionalPayment = totalAdditionalPayment;
    }


    public BigDecimal getRevenueImpact() {
        return revenueImpact;
    }

    public void setRevenueImpact(BigDecimal revenueImpact) {
        this.revenueImpact = revenueImpact;
    }
}