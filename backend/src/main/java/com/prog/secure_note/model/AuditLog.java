package com.prog.secure_note.model;

import jakarta.persistence.*; // Make sure to import all necessary JPA annotations
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "audit_log")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String action;
    private String username;

    @Column(name = "note_id")
    private Long noteId;

    @Lob
    @Column(name = "note_content", columnDefinition = "LONGTEXT") // Ensures maximum text capacity
    private String noteContent;

    private LocalDateTime timestamp;
}