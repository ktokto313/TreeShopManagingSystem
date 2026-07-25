/*
 * Author: HungDLM
 * Created Date: 2026-07-25
 * Name: ReturnEvidence.java
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
@Table(name = "return_evidence")
@Getter
@Setter
@NoArgsConstructor
public class ReturnEvidence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "return_request_id", nullable = false)
    @JsonIgnore
    private ReturnRequest returnRequest;

    @Column(
            nullable = false,
            columnDefinition = "TEXT"
    )
    private String imageUrl;

    @Column(columnDefinition = "BYTEA")
    private byte[] imageData;

    private String fileName;

    private String contentType;

    @Column(columnDefinition = "TEXT")
    private String description;

}