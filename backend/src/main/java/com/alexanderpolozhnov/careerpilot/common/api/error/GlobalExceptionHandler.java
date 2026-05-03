package com.alexanderpolozhnov.careerpilot.common.api.error;

import com.alexanderpolozhnov.careerpilot.application.exception.ApplicationNotFoundException;
import com.alexanderpolozhnov.careerpilot.auth.exception.DuplicateEmailException;
import com.alexanderpolozhnov.careerpilot.auth.exception.InvalidCredentialsException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(
        MethodArgumentNotValidException exception,
        HttpServletRequest request
    ) {
        Map<String, String> fieldErrors = exception.getBindingResult()
            .getFieldErrors()
            .stream()
            .collect(java.util.stream.Collectors.toMap(
                FieldError::getField,
                fieldError -> fieldError.getDefaultMessage() == null ? "Invalid value" : fieldError.getDefaultMessage(),
                (left, right) -> left
            ));

        return build(HttpStatus.BAD_REQUEST, "Validation failed", "VALIDATION_ERROR", request, fieldErrors);
    }

    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<ApiErrorResponse> handleDuplicateEmail(
        DuplicateEmailException exception,
        HttpServletRequest request
    ) {
        return build(HttpStatus.CONFLICT, exception.getMessage(), "DUPLICATE_EMAIL", request, Map.of());
    }

    @ExceptionHandler({InvalidCredentialsException.class, BadCredentialsException.class})
    public ResponseEntity<ApiErrorResponse> handleInvalidCredentials(
        RuntimeException exception,
        HttpServletRequest request
    ) {
        return build(HttpStatus.UNAUTHORIZED, "Invalid email or password", "INVALID_CREDENTIALS", request, Map.of());
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiErrorResponse> handleAuthentication(
        AuthenticationException exception,
        HttpServletRequest request
    ) {
        return build(HttpStatus.UNAUTHORIZED, "Unauthorized", "UNAUTHORIZED", request, Map.of());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(
        AccessDeniedException exception,
        HttpServletRequest request
    ) {
        return build(HttpStatus.FORBIDDEN, "Access denied", "ACCESS_DENIED", request, Map.of());
    }

    @ExceptionHandler(ApplicationNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleApplicationNotFound(
        ApplicationNotFoundException exception,
        HttpServletRequest request
    ) {
        return build(HttpStatus.NOT_FOUND, exception.getMessage(), "NOT_FOUND", request, Map.of());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(
        IllegalArgumentException exception,
        HttpServletRequest request
    ) {
        return build(
            HttpStatus.BAD_REQUEST,
            exception.getMessage() == null ? "Invalid request" : exception.getMessage(),
            "BAD_REQUEST",
            request,
            Map.of()
        );
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(
        NoHandlerFoundException exception,
        HttpServletRequest request
    ) {
        return build(HttpStatus.NOT_FOUND, "Resource not found", "NOT_FOUND", request, Map.of());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(
        Exception exception,
        HttpServletRequest request
    ) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected server error", "INTERNAL_ERROR", request, Map.of());
    }

    private ResponseEntity<ApiErrorResponse> build(
        HttpStatus status,
        String message,
        String code,
        HttpServletRequest request,
        Map<String, String> fieldErrors
    ) {
        ApiErrorResponse body = new ApiErrorResponse(
            Instant.now(),
            status.value(),
            status.getReasonPhrase(),
            message,
            request.getRequestURI(),
            code,
            fieldErrors
        );

        return ResponseEntity.status(status).body(body);
    }
}
