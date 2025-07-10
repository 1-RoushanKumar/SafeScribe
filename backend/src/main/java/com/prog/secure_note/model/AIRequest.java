package com.prog.secure_note.model;

import lombok.Data;

@Data
public class AIRequest {
    private String content;
    private String operation;
    private String question;
    private String summaryLength;
    private String targetLanguage;
}

