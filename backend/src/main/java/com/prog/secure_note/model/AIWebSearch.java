package com.prog.secure_note.model;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class AIWebSearch {
    private String combinedSnippets;
    private List<String> sourceUrls;
}
