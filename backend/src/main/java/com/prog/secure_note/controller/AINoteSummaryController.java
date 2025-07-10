package com.prog.secure_note.controller;

import com.prog.secure_note.model.Note;
import com.prog.secure_note.model.AIRequest;
import com.prog.secure_note.model.AIResponse;
import com.prog.secure_note.service.NoteService;
import com.prog.secure_note.ai_service.AIService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/notes/{noteId}/ai") // Specific AI operations for a note
public class AINoteSummaryController {

    private final AIService AIService;
    private final NoteService noteService; // Inject your existing NoteService

    public AINoteSummaryController(AIService AIService, NoteService noteService) {
        this.AIService = AIService;
        this.noteService = noteService;
    }

    // Endpoint for Summarization
    @PostMapping("/summarize")
    public ResponseEntity<AIResponse> summarizeNote(
            @PathVariable Long noteId,
            @RequestParam(name = "length", defaultValue = "medium") String length,
            Principal principal) {

        String username = principal.getName();
        // Use the new service method to fetch the note, which also handles ownership check
        Note note = noteService.getNoteByIdForUser(noteId, username);

        // ... rest of the method logic
        AIRequest request = new AIRequest();
        request.setOperation("summarise");
        request.setContent(note.getContent());
        request.setSummaryLength(length);

        AIResponse response = AIService.processContent(request);
        return ResponseEntity.ok(response);
    }

    // Endpoint for Answering Questions about a Note (RAG - Retrieval Augmented Generation)
    @PostMapping("/answer")
    public ResponseEntity<AIResponse> answerQuestionAboutNote(
            @PathVariable Long noteId,
            @RequestBody Map<String, String> payload, // Expecting {"question": "Your question here"}
            Principal principal) {

        String question = payload.get("question");
        if (question == null || question.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    AIResponse.builder()
                            .answer("Question is required")
                            .operation("error")
                            .sources(Collections.emptyList())
                            .build()
            );
        }

        String username = principal.getName();
        Note note = noteService.getNotesForUser(username)
                .stream()
                .filter(n -> n.getId().equals(noteId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Note not found or access denied"));

        AIRequest request = new AIRequest();
        request.setOperation("answer");
        request.setQuestion(question);
        request.setContent(note.getContent()); // Provide note content as additional context

        AIResponse response = AIService.processContent(request);
        return ResponseEntity.ok(response);
    }

    // Endpoint for Text Reading (Text-to-Speech formatting)
    @PostMapping("/read")
    public ResponseEntity<AIResponse> readNote(
            @PathVariable Long noteId,
            Principal principal) {

        String username = principal.getName();
        Note note = noteService.getNotesForUser(username)
                .stream()
                .filter(n -> n.getId().equals(noteId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Note not found or access denied"));

        AIRequest request = new AIRequest();
        request.setOperation("read");
        request.setContent(note.getContent());

        AIResponse response = AIService.processContent(request);
        return ResponseEntity.ok(response);
    }

    // Endpoint for Translation
    @PostMapping("/translate")
    public ResponseEntity<AIResponse> translateNote(
            @PathVariable Long noteId,
            @RequestParam("targetLanguage") String targetLanguage,
            Principal principal) {

        if (targetLanguage == null || targetLanguage.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    AIResponse.builder()
                            .answer("Target language is required")
                            .operation("error")
                            .sources(Collections.emptyList())   // or Collections.<String>emptyList()
                            .build()
            );
        }

        String username = principal.getName();
        Note note = noteService.getNotesForUser(username)
                .stream()
                .filter(n -> n.getId().equals(noteId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Note not found or access denied"));

        AIRequest request = new AIRequest();
        request.setOperation("translate");
        request.setContent(note.getContent());
        request.setTargetLanguage(targetLanguage);

        AIResponse response = AIService.processContent(request);
        return ResponseEntity.ok(response);
    }

    // Basic Exception Handling (You might have a @ControllerAdvice for global handling)
    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST) // Or INTERNAL_SERVER_ERROR depending on exception
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        // Log the exception for debugging
        ex.printStackTrace();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    // You'll likely need to add more specific exception handling for GeminiApiException etc.
}