package com.alexanderpolozhnov.careerpilot.telegram.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AdminCommandStateServiceImpl implements AdminCommandStateService {

    private final Map<Long, AdminGiftState> states = new ConcurrentHashMap<>();

    @Override
    public void putState(Long chatId, AdminGiftState state) {
        states.put(chatId, state);
    }

    @Override
    public Optional<AdminGiftState> getState(Long chatId) {
        return Optional.ofNullable(states.get(chatId));
    }

    @Override
    public void removeState(Long chatId) {
        states.remove(chatId);
    }

    @Override
    public boolean hasState(Long chatId) {
        return states.containsKey(chatId);
    }
}
