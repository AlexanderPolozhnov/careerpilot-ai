package com.alexanderpolozhnov.careerpilot.ai.mapper;

import com.alexanderpolozhnov.careerpilot.ai.entity.AiEntity;
import com.alexanderpolozhnov.careerpilot.ai.response.AiResultDto;
import org.springframework.stereotype.Component;

@Component
public class AiMapper {

    public AiResultDto toDto(AiEntity entity) {
        return new AiResultDto(
            entity.getId(),
            entity.getUser().getId(),
            entity.getType(),
            entity.getPrompt(),
            entity.getResult(),
            entity.getVacancyId(),
            entity.getCreatedAt(),
            entity.getTokensUsed()
        );
    }
}
