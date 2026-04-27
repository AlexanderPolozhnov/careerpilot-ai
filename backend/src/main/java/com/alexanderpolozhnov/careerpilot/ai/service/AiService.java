package com.alexanderpolozhnov.careerpilot.ai.service;

import com.alexanderpolozhnov.careerpilot.ai.request.AiRequest;
import com.alexanderpolozhnov.careerpilot.ai.response.AiResponse;

public interface AiService {
    AiResponse process(AiRequest request);
}
