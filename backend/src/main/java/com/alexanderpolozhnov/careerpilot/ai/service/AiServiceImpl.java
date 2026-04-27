package com.alexanderpolozhnov.careerpilot.ai.service;

import com.alexanderpolozhnov.careerpilot.ai.request.AiRequest;
import com.alexanderpolozhnov.careerpilot.ai.response.AiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AiServiceImpl implements AiService {
    private final LlmProvider llmProvider;

    public AiResponse process(AiRequest request) {
        return new AiResponse(llmProvider.generate(request.prompt()));
    }
}
