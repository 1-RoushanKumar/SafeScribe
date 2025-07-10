package com.prog.secure_note.controller;

import com.prog.secure_note.model.AIRequest;
import com.prog.secure_note.model.AIResponse;
import com.prog.secure_note.ai_service.AIService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/research") // Base path for research-related endpoints
public class AIForCreateNoteController {

    private final AIService researchService;

    public AIForCreateNoteController(AIService researchService) {
        this.researchService = researchService;
    }

    @PostMapping("/process")
    public ResponseEntity<AIResponse> processResearch(@RequestBody AIRequest request) {
        // The ResearchService's processContent method handles different operations
        // based on the 'operation' field in the ResearchRequest.
        AIResponse response = researchService.processContent(request);
        return ResponseEntity.ok(response);
    }
}