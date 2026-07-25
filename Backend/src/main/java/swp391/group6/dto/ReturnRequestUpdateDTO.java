/*
 * Author: HungDLM
 * Created Date: 2026-07-25
 * Last Change Author: Hung Dao
 * Last Change Date: 2026-07-25
 */
package swp391.group6.dto;

import java.util.List;

public class ReturnRequestUpdateDTO {

    private String note;
    private List<String> additionalImageUrls;

    public ReturnRequestUpdateDTO() {
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public List<String> getAdditionalImageUrls() {
        return additionalImageUrls;
    }

    public void setAdditionalImageUrls(List<String> additionalImageUrls) {
        this.additionalImageUrls = additionalImageUrls;
    }
}
