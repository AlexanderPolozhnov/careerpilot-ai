package com.alexanderpolozhnov.careerpilot.search.dto;

import java.util.List;

public record SearchResponseDto(
    List<SearchItemDto> results
) {}
