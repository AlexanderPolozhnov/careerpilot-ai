package com.alexanderpolozhnov.careerpilot.ai.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.function.Supplier;

@Slf4j
@Service
public class AiResultCacheService {

    /**
     * Get result from cache or load it using the supplier.
     * Cache key: type + vacancyId + textHash
     */
    @Cacheable(
        value = "ai_results",
        key = "#type + ':' + (#vacancyId != null ? #vacancyId : 'no-vacancy') + ':' + #textHash",
        unless = "#result == null"
    )
    public String getCachedResult(String type, UUID vacancyId, String textHash, Supplier<String> loader) {
        log.debug("Cache miss for type: {}, vacancyId: {}, textHash: {}. Loading from LLM.", type, vacancyId, textHash);
        return loader.get();
    }
}
