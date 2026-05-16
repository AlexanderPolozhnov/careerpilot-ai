# Task: Реализация Profile API

## Контекст и цель
Необходимо реализовать бэкенд и фронтенд для работы с профилем пользователя (Profile vertical slice). Профиль хранит профессиональную информацию кандидата (headline, навыки, опыт, ссылки), которая в будущем будет использоваться AI-ассистентом для генерации персонализированных откликов. За основу берется секция "Profile and resume — FUTURE TODO" из контракта. Эта задача фокусируется исключительно на Profile (данные резюме), а работа с самими файлами Resume будет вынесена в отдельную таску для чистоты PR.

## Затрагиваемые файлы

### Создать новые
- `backend/src/main/resources/db/migration/V15__create_profiles_table.sql` — миграция создания таблицы
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/profile/entity/ProfileEntity.java`
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/profile/request/ProfileRequest.java`
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/profile/response/ProfileResponse.java`
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/profile/mapper/ProfileMapper.java`
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/profile/repository/ProfileRepository.java`
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/profile/service/ProfileService.java`
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/profile/service/ProfileServiceImpl.java`
- `backend/src/main/java/com/alexanderpolozhnov/careerpilot/profile/controller/ProfileController.java`
- `frontend/src/services/profile.service.ts`

### Изменить существующие
- `frontend/src/pages/SettingsPage.tsx` — добавить вкладку или секцию "Professional Profile"
- `frontend/src/i18n/locales/ru.json` и `en.json` — добавить локализацию
- `frontend/src/types/index.ts` — (ничего менять не нужно, `Profile` уже описан)

## Backend: точная реализация

### Entity
**ProfileEntity.java**
```java
package com.alexanderpolozhnov.careerpilot.profile.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProfileEntity {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    private String headline;
    private String location;
    
    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<String> skills = new ArrayList<>();

    @Column(name = "linkedin_url")
    private String linkedinUrl;

    @Column(name = "github_url")
    private String githubUrl;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
```

### DTO
**ProfileRequest.java**
```java
package com.alexanderpolozhnov.careerpilot.profile.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ProfileRequest(
    @Size(max = 255) String headline,
    @Size(max = 255) String location,
    @Min(0) @Max(50) Integer yearsOfExperience,
    List<String> skills,
    @Size(max = 255) String linkedinUrl,
    @Size(max = 255) String githubUrl,
    @Size(max = 255) String portfolioUrl
) {}
```

**ProfileResponse.java**
```java
package com.alexanderpolozhnov.careerpilot.profile.response;

import java.util.List;
import java.util.UUID;

public record ProfileResponse(
    UUID id,
    UUID userId,
    String headline,
    String location,
    Integer yearsOfExperience,
    List<String> skills,
    String linkedinUrl,
    String githubUrl,
    String portfolioUrl
) {}
```

### Repository
```java
package com.alexanderpolozhnov.careerpilot.profile.repository;

import com.alexanderpolozhnov.careerpilot.profile.entity.ProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface ProfileRepository extends JpaRepository<ProfileEntity, UUID> {
    Optional<ProfileEntity> findByUserId(UUID userId);
}
```

### Service
```java
package com.alexanderpolozhnov.careerpilot.profile.service;

import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.profile.entity.ProfileEntity;
import com.alexanderpolozhnov.careerpilot.profile.mapper.ProfileMapper;
import com.alexanderpolozhnov.careerpilot.profile.repository.ProfileRepository;
import com.alexanderpolozhnov.careerpilot.profile.request.ProfileRequest;
import com.alexanderpolozhnov.careerpilot.profile.response.ProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.UUID;

public interface ProfileService {
    ProfileResponse getMyProfile();
    ProfileResponse updateMyProfile(ProfileRequest request);
}

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {
    private final ProfileRepository profileRepository;
    private final ProfileMapper profileMapper;
    private final CurrentUserResolver currentUserResolver; // ВАЖНО: использовать его

    @Override
    @Transactional(readOnly = true)
    public ProfileResponse getMyProfile() {
        UUID userId = currentUserResolver.resolveRequired();
        ProfileEntity profile = profileRepository.findByUserId(userId)
            .orElseGet(() -> createDefaultProfile(userId));
        return profileMapper.toResponse(profile);
    }

    @Override
    @Transactional
    public ProfileResponse updateMyProfile(ProfileRequest request) {
        UUID userId = currentUserResolver.resolveRequired();
        ProfileEntity profile = profileRepository.findByUserId(userId)
            .orElseGet(() -> createDefaultProfile(userId));
        
        profileMapper.updateEntity(request, profile);
        return profileMapper.toResponse(profileRepository.save(profile));
    }

    private ProfileEntity createDefaultProfile(UUID userId) {
        ProfileEntity profile = new ProfileEntity();
        profile.setUserId(userId);
        profile.setSkills(new ArrayList<>());
        return profileRepository.save(profile);
    }
}
```

### Controller
```java
package com.alexanderpolozhnov.careerpilot.profile.controller;

import com.alexanderpolozhnov.careerpilot.profile.request.ProfileRequest;
import com.alexanderpolozhnov.careerpilot.profile.response.ProfileResponse;
import com.alexanderpolozhnov.careerpilot.profile.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@Validated
public class ProfileController {
    private final ProfileService profileService;

    @GetMapping("/me")
    public ProfileResponse getMyProfile() {
        return profileService.getMyProfile();
    }

    @PutMapping("/me")
    public ProfileResponse updateMyProfile(@Valid @RequestBody ProfileRequest request) {
        return profileService.updateMyProfile(request);
    }
}
```

### MapStruct mapper
```java
package com.alexanderpolozhnov.careerpilot.profile.mapper;

import com.alexanderpolozhnov.careerpilot.profile.entity.ProfileEntity;
import com.alexanderpolozhnov.careerpilot.profile.request.ProfileRequest;
import com.alexanderpolozhnov.careerpilot.profile.response.ProfileResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProfileMapper {
    ProfileResponse toResponse(ProfileEntity entity);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(ProfileRequest request, @MappingTarget ProfileEntity entity);
}
```

### Flyway миграция
**V15__create_profiles_table.sql**
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    headline VARCHAR(255),
    location VARCHAR(255),
    years_of_experience INT,
    skills JSONB,
    linkedin_url VARCHAR(255),
    github_url VARCHAR(255),
    portfolio_url VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
```

## Frontend: точная реализация

### API-функция (`services/profile.service.ts`)
```typescript
import { apiClient } from '@/lib/api-client'
import type { Profile } from '@/types'

export const profileService = {
  getMe: async (): Promise<Profile> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return {
        id: 'mock-id',
        userId: 'user1',
        headline: 'Frontend Engineer',
        location: 'Remote',
        yearsOfExperience: 3,
        skills: ['React', 'TypeScript'],
      }
    }
    const { data } = await apiClient.get<Profile>('/profile/me')
    return data
  },
  
  updateMe: async (payload: Partial<Profile>): Promise<Profile> => {
    if (import.meta.env.VITE_USE_MOCKS === 'true') {
      return payload as Profile
    }
    const { data } = await apiClient.put<Profile>('/profile/me', payload)
    return data
  }
}
```

### React Query & UI
Поскольку Profile логически тесно связан с настройками аккаунта, реализуй это как новую секцию внутри `SettingsPage.tsx`.
Назови новую форму `professionalProfileForm` (по аналогии с существующими).
Используй `ds-card` и `ds-anim-rise` классы из дизайн-системы.
- Для редактирования списка `skills` можно использовать простое текстовое поле (разделение через запятую, затем `split(',').map(s => s.trim())`), либо любой готовый multi-select.

### i18n ключи
Добавить в `ru.json` и `en.json` (раздел `settings`):
```json
"professionalProfile": "Профессиональный профиль",
"headline": "Заголовок / Должность",
"yearsOfExperience": "Опыт работы (лет)",
"skills": "Навыки (через запятую)",
"linkedinUrl": "LinkedIn",
"githubUrl": "GitHub",
"portfolioUrl": "Портфолио",
"profileSaved": "Профиль успешно сохранен",
"profileError": "Ошибка при сохранении профиля"
```

## Порядок реализации для SWE-1.6
1. Создать Flyway миграцию `V15__create_profiles_table.sql`.
2. Создать Entity, DTO, Mapper, Repository.
3. Реализовать Service (с `CurrentUserResolver.resolveRequired()`) и Controller.
4. Добавить сервис во фронтенде (`profile.service.ts`).
5. Интегрировать форму `professionalProfileForm` в `SettingsPage.tsx` (использовать `useMutation` с ключами `['profile', 'me']`).
6. Добавить новые ключи локализации.

## Риски и что проверить
- **JSONB маппинг:** В Hibernate 6 `@JdbcTypeCode(SqlTypes.JSON)` должен корректно работать с `List<String>`. Проверьте, что сохранение и чтение списка навыков работает без ошибок сериализации.
- **Upsert-паттерн:** Использование `orElseGet` означает, что дефолтный пустой профиль создается "на лету" при первом `GET /profile/me`. Убедитесь, что это не нарушает констрейнты NOT NULL (помимо `user_id`, остальные поля у нас nullable, что безопасно).

## Проверки после реализации
**Backend:** 
Напишите простые тесты `ProfileServiceImplTest` и `ProfileControllerTest`.
Затем запустите: `.\mvnw.cmd test -Dtest="ProfileServiceImplTest,ProfileControllerTest"`
**Frontend:** 
`cd frontend && npm run build`
