package com.alexanderpolozhnov.careerpilot.search.controller;

import com.alexanderpolozhnov.careerpilot.search.dto.SearchResponseDto;
import com.alexanderpolozhnov.careerpilot.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {
    private final SearchService searchService;

    @GetMapping
    public SearchResponseDto search(@RequestParam String q) {
        return searchService.search(q);
    }
}
