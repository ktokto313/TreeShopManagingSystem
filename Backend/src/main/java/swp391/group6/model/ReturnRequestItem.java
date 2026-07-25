/*
 * Author: HungDLM
 * Created Date: 2026-07-25
 * Name: ReturnRequestItem.java
 * Description:
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-25
 */
package swp391.group6.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "return_request_item")
@Getter
@Setter
@NoArgsConstructor
public class ReturnRequestItem {


    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "return_request_id", nullable = false)
    @JsonIgnore
    private ReturnRequest returnRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumns({
            @JoinColumn(
                    name = "order_id",
                    referencedColumnName = "order_id"
            ),
            @JoinColumn(
                    name = "product_id",
                    referencedColumnName = "product_id"
            )
    })
    private OrderDetail orderDetail;

    @Column(nullable = false)
    private Integer quantity;

}