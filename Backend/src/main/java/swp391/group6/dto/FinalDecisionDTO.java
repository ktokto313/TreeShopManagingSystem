/*
 * Author: HungDLM
 * Created Date: 2026-07-25
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-25
 */
package swp391.group6.dto;

public class FinalDecisionDTO {

    public enum Decision {
        APPROVE,
        DECLINE
    }

    private Decision decision;
    private String reason;

    public FinalDecisionDTO() {
    }

    public Decision getDecision() {
        return decision;
    }

    public void setDecision(Decision decision) {
        this.decision = decision;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
