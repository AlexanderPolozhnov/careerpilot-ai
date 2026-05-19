package com.alexanderpolozhnov.careerpilot.search.dto;

import java.util.UUID;

public record SearchItemDto(
    UUID id,
    SearchItemType type,
    String title,
    String subtitle,
    String status,
    String url
) {}
