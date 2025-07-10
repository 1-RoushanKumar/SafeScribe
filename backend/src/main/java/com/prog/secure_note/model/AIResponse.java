package com.prog.secure_note.model;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AIResponse {
    private String answer;
    private List<String> sources;
    private String operation;
}
