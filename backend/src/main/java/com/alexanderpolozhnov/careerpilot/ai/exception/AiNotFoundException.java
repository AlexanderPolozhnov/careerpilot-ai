package com.alexanderpolozhnov.careerpilot.ai.exception;

import java.util.UUID;

public class AiNotFoundException extends RuntimeException {
    public AiNotFoundException(UUID id) {
        super("AI result not found: " + id);
    }
}
