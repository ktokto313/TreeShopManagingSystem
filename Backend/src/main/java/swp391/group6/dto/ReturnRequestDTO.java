/*
 * Author: HungDLM
 * Created Date: 2026-07-25
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-28
 */
package swp391.group6.dto;

import swp391.group6.model.ReturnReason;
import swp391.group6.model.ReturnType;

import java.util.List;

public class ReturnRequestDTO {

    private String orderId;

    private List<OrderDetailQuantityDTO> items;

    private ReturnReason reason;

    private List<String> evidenceImageUrls;

    private ReturnType returnType;

    private List<ExchangeProductDTO> exchangeProducts;


    public ReturnRequestDTO() {}


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

    public void setExchangeProducts(List<ExchangeProductDTO> exchangeProducts) {
        this.exchangeProducts = exchangeProducts;
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