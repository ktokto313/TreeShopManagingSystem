package swp391.group6.util;

import tools.jackson.databind.ObjectMapper;

public final class JacksonUtil {
    private JacksonUtil() {}

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static String parseObjectToJSONString(Object object) {
        try {
            return objectMapper.writeValueAsString(object);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize object to JSON", e);
        }
    }

    public static <T> T parseJSONToObject(String json, Class<T> clazz) {
        try {
            return objectMapper.readValue(json, clazz);
        } catch (Exception e) {
            throw new RuntimeException("Failed to deserialize JSON to object", e);
        }
    }
}
