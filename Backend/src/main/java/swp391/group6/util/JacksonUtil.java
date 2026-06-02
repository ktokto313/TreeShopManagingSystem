package swp391.group6.util;

import tools.jackson.databind.ObjectMapper;

public final class JacksonUtil {
    private JacksonUtil() {}

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static String parseObjectToJSONString(Object object) {
        return objectMapper.writeValueAsString(object);
    }

    public static <T> T parseJSONToObject(String json, Class<T> clazz) {
        return objectMapper.readValue(json, clazz);
    }
}
