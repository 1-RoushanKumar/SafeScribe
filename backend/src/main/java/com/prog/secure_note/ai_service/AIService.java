package com.prog.secure_note.ai_service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prog.secure_note.exception.GeminiApiException;
import com.prog.secure_note.exception.InvalidOperationException;
import com.prog.secure_note.model.AIRequest;
import com.prog.secure_note.model.AIResponse;
import com.prog.secure_note.model.AIWebSearch;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AIService {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    @Value("${gemini.api.url}")
    private String geminiApiUrl;
    @Value("${gemini.api.key}")
    private String geminiApiKey;
    @Value("${google.search.api.key}")
    private String googleSearchApiKey;
    @Value("${google.search.cse.id}")
    private String googleCseId;

    public AIService(ObjectMapper objectMapper) {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = objectMapper;
    }

    public AIResponse processContent(AIRequest request) {
        if (request.getOperation() == null || request.getOperation().isEmpty()) {
            throw new IllegalArgumentException("Operation field is required");
        }

        AIWebSearch webResults = null;
        String finalQuestion = request.getQuestion();

        boolean requiresWebSearch = false;
        if (request.getOperation().equalsIgnoreCase("answer") && finalQuestion != null && !finalQuestion.isEmpty()) {
            String lowerCaseQuestion = finalQuestion.toLowerCase();
            String[] searchKeywords = {"upcoming", "latest", "current", "news", "release date", "who is", "when is", "what is the current", "recent", "as of today", "last part", "newest"};
            for (String keyword : searchKeywords) {
                if (lowerCaseQuestion.contains(keyword)) {
                    requiresWebSearch = true;
                    break;
                }
            }
            if (lowerCaseQuestion.contains("tom cruise") && lowerCaseQuestion.contains("movies")) {
                requiresWebSearch = true;
            }
        }

        if (requiresWebSearch) {
            webResults = performWebSearch(finalQuestion);
        }

        if (request.getOperation().equalsIgnoreCase("similar")) {
            String explanationResult = processSimilarResearch(request);
            return AIResponse.builder()
                    .answer(explanationResult)
                    .operation(request.getOperation())
                    .sources(null)
                    .build();
        }

        String prompt = buildPrompt(request, webResults);

        Map<String, Object> requestBody = Map.of("contents", new Object[]{
                Map.of("parts", new Object[]{
                        Map.of("text", prompt)
                })
        });

        String jsonRequestBody;
        try {
            jsonRequestBody = objectMapper.writeValueAsString(requestBody);
        } catch (IOException e) {
            throw new GeminiApiException("Error converting request body to JSON for Gemini API", e);
        }

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(geminiApiUrl + geminiApiKey))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonRequestBody))
                .build();

        String responseBody;
        try {
            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                throw new GeminiApiException("Gemini API returned non-200 status: " + response.statusCode());
            }
            responseBody = response.body();
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new GeminiApiException("Gemini API call interrupted", e);
        }

        String extractedResult = extractTextFromResponse(responseBody);

        return AIResponse.builder()
                .answer(extractedResult)
                .operation(request.getOperation())
                .sources(webResults != null ? webResults.getSourceUrls() : null)
                .build();
    }

    private AIWebSearch performWebSearch(String query) {
        try {
            String apiUrl = "https://www.googleapis.com/customsearch/v1" +
                            "?key=" + googleSearchApiKey +
                            "&cx=" + googleCseId +
                            "&q=" + URLEncoder.encode(query, StandardCharsets.UTF_8) +
                            "&num=5";

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                System.err.println("Google Search API returned non-200 status: " + response.statusCode());
                return null;
            }

            JsonNode json = objectMapper.readTree(response.body());
            StringBuilder snippets = new StringBuilder();
            List<String> urls = new ArrayList<>();

            if (json.has("items") && json.get("items").isArray()) {
                for (JsonNode item : json.get("items")) {
                    String title = item.has("title") ? item.get("title").asText() : "N/A";
                    String link = item.has("link") ? item.get("link").asText() : "N/A";
                    String snippet = item.has("snippet") ? item.get("snippet").asText() : "N/A";

                    snippets.append("Title: ").append(title).append("\n")
                            .append("URL: ").append(link).append("\n")
                            .append("Snippet: ").append(snippet).append("\n")
                            .append("---\n");
                    if (!"N/A".equals(link)) {
                        urls.add(link);
                    }
                }
            }
            return AIWebSearch.builder()
                    .combinedSnippets(snippets.toString())
                    .sourceUrls(urls)
                    .build();

        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            System.err.println("Web search (Google) API call interrupted or network error: " + e.getMessage());
            e.printStackTrace();
            return null;
        } catch (Exception e) {
            System.err.println("Web search (Google) API general exception: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }

    private String processSimilarResearch(AIRequest request) {
        String prompt = buildPrompt(request, null);

        Map<String, Object> requestBody = Map.of("contents", new Object[]{
                Map.of("parts", new Object[]{
                        Map.of("text", prompt)
                })
        });

        String jsonRequestBody;
        try {
            jsonRequestBody = objectMapper.writeValueAsString(requestBody);
        } catch (IOException e) {
            throw new GeminiApiException("Error converting request body to JSON for Gemini API", e);
        }

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create(geminiApiUrl + geminiApiKey))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonRequestBody))
                .build();

        String geminiResponse;
        try {
            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                throw new GeminiApiException("Gemini API returned non-200 status for similar research (explanation): " + response.statusCode() + " Body: " + response.body());
            }
            geminiResponse = response.body();
        } catch (IOException e) {
            throw new GeminiApiException("Network error or issue connecting to Gemini API for similar research (explanation)", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new GeminiApiException("Gemini API call for similar research (explanation) interrupted", e);
        }

        String explanationResult = extractTextFromResponse(geminiResponse);

        if (explanationResult == null || explanationResult.trim().isEmpty() || explanationResult.equalsIgnoreCase("No response found") || explanationResult.contains("Error processing response")) {
            return "Could not provide a detailed explanation for the topic.";
        }

        return explanationResult;
    }

    private String extractTextFromResponse(String response) {
        try {
            JsonNode root = objectMapper.readTree(response);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode firstCandidate = candidates.get(0);
                JsonNode content = firstCandidate.path("content");
                JsonNode parts = content.path("parts");
                if (parts.isArray() && parts.size() > 0) {
                    JsonNode firstPart = parts.get(0);
                    if (firstPart.has("text")) {
                        return firstPart.get("text").asText();
                    }
                }
            }
            return "No response found";
        } catch (Exception e) {
            System.err.println("Error processing Gemini response JSON: " + e.getMessage());
            e.printStackTrace();
            return "Error processing response: " + e.getMessage();
        }
    }

    private String buildPrompt(AIRequest request, AIWebSearch webResults) {
        StringBuilder prompt = new StringBuilder();
        String operation = request.getOperation();
        if (operation == null) {
            throw new IllegalArgumentException("Operation cannot be null");
        }

        switch (operation.toLowerCase()) {
            case "summarise":
                String lengthInstruction = "short".equalsIgnoreCase(request.getSummaryLength()) ? "1-2 sentences" :
                        "long".equalsIgnoreCase(request.getSummaryLength()) ? "1-2 paragraphs with details" :
                                "3-5 sentences covering key points";
                prompt.append("Summarize in ").append(lengthInstruction).append(":\n\n")
                        .append(request.getContent());
                break;

            case "read":
                prompt.append("Convert the following text into a clean, natural format suitable for text-to-speech. ")
                        .append("Remove any formatting markup, fix sentence structure, and ensure proper punctuation for natural speech flow. ")
                        .append("Preserve the original meaning but make it sound conversational and easy to listen to. ")
                        .append("Do not add any additional commentary or explanations - just return the cleaned text ready for speech synthesis:\n\n")
                        .append(request.getContent());
                break;

            case "translate":
                if (request.getTargetLanguage() == null || request.getTargetLanguage().isEmpty()) {
                    throw new IllegalArgumentException("Target language required for translation");
                }
                prompt.append("Translate to ").append(request.getTargetLanguage()).append(":\n\n")
                        .append(request.getContent());
                break;

            case "answer":
                if (request.getQuestion() == null || request.getQuestion().isEmpty()) {
                    throw new IllegalArgumentException("Question required for answer operation");
                }
                if (webResults != null && webResults.getCombinedSnippets() != null &&
                    !webResults.getCombinedSnippets().trim().isEmpty()) {
                    prompt.append("Recent search results:\n")
                            .append(webResults.getCombinedSnippets())
                            .append("\n");
                }
                prompt.append("Answer directly and factually. Correct any false premises. Be concise.\n")
                        .append("Question: ").append(request.getQuestion());
                if (request.getContent() != null && !request.getContent().isEmpty()) {
                    prompt.append("\nContext: ").append(request.getContent());
                }
                break;

            case "similar":
                if (request.getQuestion() == null || request.getQuestion().isEmpty()) {
                    throw new IllegalArgumentException("Question/Topic is required for 'similar' operation (explanation).");
                }
                prompt.append("Provide a comprehensive, detailed, and factual explanation of the following concept or topic. ")
                        .append("Include its definition, key principles, historical context (if relevant), main theories, significant discoveries, and real-world applications. ")
                        .append("Structure your response using **Markdown format** with clear headings (e.g., `## Heading`), bold text (e.g., `**text**`), and bullet points (e.g., `* item`). ")
                        .append("Aim for a detailed academic overview suitable for a research note. ")
                        .append("Do not include any introductory or concluding sentences outside the main explanation. ")
                        .append("If the topic is too broad or cannot be explained concisely, focus on its most fundamental aspects.\n\n")
                        .append("Concept/Topic: ").append(request.getQuestion());
                break;

            default:
                throw new InvalidOperationException("Invalid operation: " + operation +
                                                    ". Supported: summarise, read, answer, translate, similar");
        }

        return prompt.toString();
    }
}
