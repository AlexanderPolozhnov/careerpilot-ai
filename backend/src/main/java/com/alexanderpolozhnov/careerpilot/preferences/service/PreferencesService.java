package com.alexanderpolozhnov.careerpilot.preferences.service;

import com.alexanderpolozhnov.careerpilot.preferences.request.PreferencesRequest;
import com.alexanderpolozhnov.careerpilot.preferences.response.PreferencesResponse;

public interface PreferencesService {
    PreferencesResponse getPreferences();

    PreferencesResponse updatePreferences(PreferencesRequest request);
}
