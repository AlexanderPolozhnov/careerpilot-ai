package com.alexanderpolozhnov.careerpilot.ai.controller;

import com.alexanderpolozhnov.careerpilot.ai.request.AiRequest;
import com.alexanderpolozhnov.careerpilot.ai.response.AiResponse;
import com.alexanderpolozhnov.careerpilot.ai.service.AiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {
    private final AiService aiService;

    @PostMapping("/process")
    public AiResponse process(@Valid @RequestBody AiRequest request) {
        return aiService.process(request);
    }
}
