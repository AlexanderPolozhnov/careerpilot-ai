package com.alexanderpolozhnov.careerpilot.telegram.service;

import java.util.Optional;

public interface AdminCommandStateService {
    void putState(Long chatId, AdminGiftState state);
    Optional<AdminGiftState> getState(Long chatId);
    void removeState(Long chatId);
    boolean hasState(Long chatId);
}
