import { requestJson } from "../../utils/api";

export function getRecommendations(payload) {
  return requestJson("/api/recommendations", {
    method: "POST",
    body: payload,
  });
}
