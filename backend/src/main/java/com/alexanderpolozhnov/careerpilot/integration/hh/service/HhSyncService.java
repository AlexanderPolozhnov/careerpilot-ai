package com.alexanderpolozhnov.careerpilot.integration.hh.service;

import java.util.Map;
import java.util.UUID;

public interface HhSyncService {

    /**
     * Генерирует URL для OAuth2-авторизации через hh.ru.
     */
    String buildAuthorizationUrl();

    /**
     * Обменивает авторизационный код на access/refresh токены и сохраняет HhIntegrationEntity.
     *
     * @param code   авторизационный код от hh.ru
     * @param userId ID текущего пользователя
     */
    void handleCallback(String code, UUID userId);

    /**
     * Возвращает данные резюме пользователя из hh.ru API для предпросмотра перед синхронизацией.
     *
     * @param userId ID пользователя
     * @return Map с полями: name, location, skills, yearsOfExperience и другими данными с hh.ru
     */
    Map<String, Object> getResumePreview(UUID userId);

    /**
     * Синхронизирует выбранные поля из hh.ru в профиль пользователя CareerPilot.
     *
     * @param userId        ID пользователя
     * @param fieldsToSync  список имен полей для синхронизации
     */
    void syncSelectedFields(UUID userId, java.util.List<String> fieldsToSync);

    /**
     * Отключает интеграцию с hh.ru (удаляет токены).
     *
     * @param userId ID пользователя
     */
    void disconnect(UUID userId);

    /**
     * Проверяет, подключена ли интеграция hh.ru для данного пользователя.
     */
    boolean isConnected(UUID userId);
}
