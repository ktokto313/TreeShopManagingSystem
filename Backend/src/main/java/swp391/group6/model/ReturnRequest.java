/*
 * Author: HungDLM
 * Created Date: 2026-07-25
 * Name: ReturnRequest.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-25
 */
package swp391.group6.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "return_request")
@Getter
@Setter
@NoArgsConstructor
public class ReturnRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReturnReason reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "return_type", nullable = false)
    private ReturnType returnType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReturnStatus status;

    @Column(name = "expected_fee", precision = 12, scale = 2)
    private BigDecimal expectedFee;

    @Column(name = "price_difference", precision = 12, scale = 2)
    private BigDecimal priceDifference;

    @Column(name = "refund_amount", precision = 12, scale = 2)
    private BigDecimal refundAmount;

    @Column(name = "additional_payment", precision = 12, scale = 2)
    private BigDecimal additionalPayment;

    @Column(name = "financial_processed", nullable = false)
    private boolean financialProcessed = false;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "bank_account")
    private String bankAccount;

    @Column(name = "account_number")
    private String accountNumber;

    @Column(name = "account_holder")
    private String accountHolder;

    @Column(name = "manager_note", length = 1000)
    private String managerNote;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;


    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @OneToMany(
            mappedBy = "returnRequest",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<ReturnRequestItem> items = new ArrayList<>();

    @OneToMany(
            mappedBy = "returnRequest",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<ReturnEvidence> evidences = new ArrayList<>();

    @OneToOne(
            mappedBy = "returnRequest",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private ReturnExchangeProduct exchangeProduct;

    @PrePersist
    protected void onCreate(){

        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if(status == null){
            status = ReturnStatus.PENDING;
        }
    }

    @PreUpdate
    protected void onUpdate(){

        updatedAt = LocalDateTime.now();

    }

}