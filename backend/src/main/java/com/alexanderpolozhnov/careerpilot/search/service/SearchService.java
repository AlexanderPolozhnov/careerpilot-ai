package com.alexanderpolozhnov.careerpilot.search.service;

import com.alexanderpolozhnov.careerpilot.search.dto.SearchResponseDto;

public interface SearchService {
    SearchResponseDto search(String query);
}
