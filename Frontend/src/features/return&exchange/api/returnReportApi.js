import { requestJson } from "../../../utils/api";
export async function getReturnReport() {

    return requestJson(
        "/api/return-requests/manager/report",
        {
            method: "GET"
        }
    );

}