/*
 * Created By: MinhLTHE200133
 * Created At: 2026-06-23
 * Last Modified: 2026-06-23
 */
package swp391.group6.dto;

public class WishlistCheckResponse {
    private boolean wishlisted;

    public WishlistCheckResponse(boolean wishlisted) {
        this.wishlisted = wishlisted;
    }

    public boolean isWishlisted() {
        return wishlisted;
    }

    public void setWishlisted(boolean wishlisted) {
        this.wishlisted = wishlisted;
    }
}
