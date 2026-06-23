package com.alexanderpolozhnov.careerpilot.preferences.repository;

import com.alexanderpolozhnov.careerpilot.preferences.entity.PreferencesEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PreferencesRepository extends JpaRepository<PreferencesEntity, UUID> {
    Optional<PreferencesEntity> findByUserId(UUID userId);

    Optional<PreferencesEntity> findByTelegramConnectToken(UUID token);

    List<PreferencesEntity> findByTelegramChatId(String telegramChatId);

    boolean existsByTelegramChatId(String telegramChatId);

    Optional<PreferencesEntity> findFirstByTelegramUsernameIgnoreCase(String username);

    @Query("SELECT p.telegramChatId FROM PreferencesEntity p WHERE p.telegramChatId IS NOT NULL")
    List<String> findAllTelegramChatIds();
}

