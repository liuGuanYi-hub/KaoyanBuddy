package com.kaoyanbuddy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class KaoyanBuddyApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registerLoginAndMeWork() throws Exception {
        String username = "user_" + UUID.randomUUID().toString().substring(0, 8);
        String token = register(username);

        mockMvc.perform(get("/api/auth/me").header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username", is(username)));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("username", username, "password", "secret123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString());
    }

    @Test
    void protectedRoutesRequireJwt() throws Exception {
        mockMvc.perform(get("/api/subjects"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void healthIsPublic() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")));
    }

    @Test
    void userCanCreateTaskCompleteItAndSeeDashboard() throws Exception {
        String token = register("plan_" + UUID.randomUUID().toString().substring(0, 8));
        Long subjectId = createSubject(token);

        String taskBody = json(Map.of(
                "subjectId", subjectId,
                "title", "英语阅读真题",
                "description", "完成两篇阅读并复盘",
                "taskDate", LocalDate.now().toString(),
                "status", "TODO",
                "priority", "HIGH",
                "plannedMinutes", 90,
                "actualMinutes", 0
        ));

        String taskJson = mockMvc.perform(post("/api/tasks")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(taskBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("英语阅读真题")))
                .andReturn()
                .getResponse()
                .getContentAsString();
        long taskId = objectMapper.readTree(taskJson).get("id").asLong();

        mockMvc.perform(patch("/api/tasks/{id}/status", taskId)
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("status", "DONE", "actualMinutes", 85))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("DONE")));

        mockMvc.perform(get("/api/dashboard/summary")
                        .header("Authorization", bearer(token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalTasks", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.completedTasks", greaterThanOrEqualTo(1)));
    }

    @Test
    void taskGenerationAndAiFallbackWorkWithoutDeepSeekKey() throws Exception {
        String token = register("ai_" + UUID.randomUUID().toString().substring(0, 8));

        mockMvc.perform(post("/api/tasks/generate")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("date", LocalDate.now().toString(), "totalMinutes", 360))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].subject.name").isString());

        mockMvc.perform(post("/api/ai/chat")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("message", "数学复习怎么安排？"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fallback", is(true)))
                .andExpect(jsonPath("$.answer").isString());
    }

    private String register(String username) throws Exception {
        String body = json(Map.of(
                "username", username,
                "email", username + "@example.com",
                "password", "secret123"
        ));
        String response = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        JsonNode json = objectMapper.readTree(response);
        return json.get("token").asText();
    }

    private Long createSubject(String token) throws Exception {
        String response = mockMvc.perform(post("/api/subjects")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "name", "英语",
                                "category", "公共课",
                                "color", "#22c55e",
                                "targetHours", 180
                        ))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return objectMapper.readTree(response).get("id").asLong();
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private String json(Object value) throws Exception {
        return objectMapper.writeValueAsString(value);
    }
}
