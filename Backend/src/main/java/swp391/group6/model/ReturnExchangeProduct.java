/*
 * Author: HungDLM
 * Created Date: 2026-07-25
 * Name: ReturnExchangeProduct.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-25
 */
package swp391.group6.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "return_exchange_product")
@Getter
@Setter
@NoArgsConstructor
public class ReturnExchangeProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "return_request_id",
            nullable = false
    )
    @JsonIgnore
    private ReturnRequest returnRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "product_id",
            nullable = false
    )
    private Product product;

    @Column(nullable = false)
    private Integer quantity = 1;

}