/*
 * Author: HungDLM
 * Created Date: 2026-07-25
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-31
 */
package swp391.group6.dto;

import swp391.group6.model.ReturnReason;
import swp391.group6.model.ReturnType;

import java.math.BigDecimal;
import java.util.List;

public class ReturnRequestDTO {

    private String orderId;

    private List<OrderDetailQuantityDTO> items;

    private ReturnReason reason;

    private List<String> evidenceImageUrls;

    private ReturnType returnType;

    private List<ExchangeProductDTO> exchangeProducts;



    private BigDecimal returnedValue;

    private BigDecimal exchangeValue;

    private BigDecimal additionalPayment;


    public ReturnRequestDTO() {
    }


    public ReturnRequestDTO(
            BigDecimal returnedValue,
            BigDecimal exchangeValue,
            BigDecimal additionalPayment
    ) {
        this.returnedValue = returnedValue;
        this.exchangeValue = exchangeValue;
        this.additionalPayment = additionalPayment;
    }




    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }


    public List<OrderDetailQuantityDTO> getItems() {
        return items;
    }

    public void setItems(List<OrderDetailQuantityDTO> items) {
        this.items = items;
    }


    public ReturnReason getReason() {
        return reason;
    }

    public void setReason(ReturnReason reason) {
        this.reason = reason;
    }


    public List<String> getEvidenceImageUrls() {
        return evidenceImageUrls;
    }

    public void setEvidenceImageUrls(List<String> evidenceImageUrls) {
        this.evidenceImageUrls = evidenceImageUrls;
    }


    public ReturnType getReturnType() {
        return returnType;
    }

    public void setReturnType(ReturnType returnType) {
        this.returnType = returnType;
    }


    public List<ExchangeProductDTO> getExchangeProducts() {
        return exchangeProducts;
    }

    public void setExchangeProducts(
            List<ExchangeProductDTO> exchangeProducts
    ) {
        this.exchangeProducts = exchangeProducts;
    }

    public BigDecimal getReturnedValue() {
        return returnedValue;
    }

    public void setReturnedValue(BigDecimal returnedValue) {
        this.returnedValue = returnedValue;
    }

    public BigDecimal getExchangeValue() {
        return exchangeValue;
    }

    public void setExchangeValue(BigDecimal exchangeValue) {
        this.exchangeValue = exchangeValue;
    }

    public BigDecimal getAdditionalPayment() {
        return additionalPayment;
    }

    public void setAdditionalPayment(BigDecimal additionalPayment) {
        this.additionalPayment = additionalPayment;
    }

    public static class OrderDetailQuantityDTO {

        private String productId;

        private Integer quantity;


        public String getProductId() {
            return productId;
        }

        public void setProductId(String productId) {
            this.productId = productId;
        }


        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }

    public static class ExchangeProductDTO {

        private String productId;

        private Integer quantity;


        public String getProductId() {
            return productId;
        }

        public void setProductId(String productId) {
            this.productId = productId;
        }


        public Integer getQuantity() {
            return quantity;
        }

        public void setQuantity(Integer quantity) {
            this.quantity = quantity;
        }
    }
}