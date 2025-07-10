package com.prog.secure_note.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR) // Default to 500
public class SemanticScholarException extends RuntimeException {
    public SemanticScholarException(String message) {
        super(message);
    }

    public SemanticScholarException(String message, Throwable cause) {
        super(message, cause);
    }
}
