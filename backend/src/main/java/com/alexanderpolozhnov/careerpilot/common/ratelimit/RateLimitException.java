package com.alexanderpolozhnov.careerpilot.common.ratelimit;

public class RateLimitException extends RuntimeException {
    public RateLimitException(String message) {
        super(message);
    }
}
