package com.alexanderpolozhnov.careerpilot.resume.service;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.resume.entity.UserResumeEntity;
import com.alexanderpolozhnov.careerpilot.resume.mapper.UserResumeMapper;
import com.alexanderpolozhnov.careerpilot.resume.repository.UserResumeRepository;
import com.alexanderpolozhnov.careerpilot.resume.request.UserResumeRequest;
import com.alexanderpolozhnov.careerpilot.resume.response.UserResumeResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserResumeServiceImpl implements UserResumeService {

    private final UserResumeRepository userResumeRepository;
    private final CurrentUserResolver currentUserResolver;
    private final UserResumeMapper userResumeMapper;

    @Override
    @Transactional(readOnly = true)
    public UserResumeResponse getMyResume() {
        UUID userId = currentUserResolver.resolveRequired().getId();
        log.info("userResume.getMyResume userId={}", userId);
        return userResumeRepository.findByUserId(userId)
                .map(userResumeMapper::toResponse)
                .orElseGet(() -> new UserResumeResponse(null, userId, "", "", null, null));
    }

    @Override
    @Transactional
    public UserResumeResponse updateMyResume(UserResumeRequest request) {
        AuthEntity user = currentUserResolver.resolveRequired();
        log.info("userResume.updateMyResume userId={}", user.getId());

        UserResumeEntity entity = userResumeRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    UserResumeEntity newEntity = new UserResumeEntity();
                    newEntity.setUser(user);
                    return newEntity;
                });

        userResumeMapper.updateEntity(request, entity);
        UserResumeEntity saved = userResumeRepository.save(entity);
        return userResumeMapper.toResponse(saved);
    }
}
