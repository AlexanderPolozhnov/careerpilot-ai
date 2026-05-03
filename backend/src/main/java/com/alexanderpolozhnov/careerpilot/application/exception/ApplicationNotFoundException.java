package com.alexanderpolozhnov.careerpilot.application.exception;

import java.util.UUID;

/**
 * Исключение: заявка не найдена или не принадлежит текущему пользователю.
 */
public class ApplicationNotFoundException extends RuntimeException {
    public ApplicationNotFoundException(UUID id) {
        super("Application not found: " + id);
    }
}
