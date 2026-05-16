package com.alexanderpolozhnov.careerpilot.resume.service;

import com.alexanderpolozhnov.careerpilot.auth.entity.AuthEntity;
import com.alexanderpolozhnov.careerpilot.common.service.CurrentUserResolver;
import com.alexanderpolozhnov.careerpilot.resume.entity.ResumeEntity;
import com.alexanderpolozhnov.careerpilot.resume.mapper.ResumeMapper;
import com.alexanderpolozhnov.careerpilot.resume.repository.ResumeRepository;
import com.alexanderpolozhnov.careerpilot.resume.request.ResumeRequest;
import com.alexanderpolozhnov.careerpilot.resume.response.ResumeResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class ResumeServiceImpl implements ResumeService {

    private final ResumeRepository resumeRepository;
    private final CurrentUserResolver currentUserResolver;
    private final ResumeMapper resumeMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ResumeResponse> list() {
        UUID userId = currentUserResolver.resolveRequired().getId();
        List<ResumeEntity> entities = resumeRepository.findAllByUserId(userId);
        log.info("resumes.list userId={} count={}", userId, entities.size());
        return entities.stream()
                .map(resumeMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ResumeResponse create(ResumeRequest request) {
        AuthEntity currentUser = currentUserResolver.resolveRequired();
        ResumeEntity entity = new ResumeEntity();
        entity.setUser(currentUser);
        entity.setName(request.name().trim());
        entity.setFileUrl(request.fileUrl());
        entity.setTextContent(request.textContent());
        entity.setIsDefault(request.isDefault() != null ? request.isDefault() : false);

        if (Boolean.TRUE.equals(entity.getIsDefault())) {
            resetOtherResumesDefault(currentUser.getId());
        }

        ResumeEntity saved = resumeRepository.save(entity);
        log.info("resumes.create userId={} id={} name={} isDefault={}", 
                currentUser.getId(), saved.getId(), saved.getName(), saved.getIsDefault());
        return resumeMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ResumeResponse getById(UUID id) {
        return resumeMapper.toResponse(findOwnedResume(id));
    }

    @Override
    @Transactional
    public ResumeResponse update(UUID id, ResumeRequest request) {
        UUID userId = currentUserResolver.resolveRequired().getId();
        ResumeEntity entity = findOwnedResume(id);

        if (request.name() != null && !request.name().isBlank()) {
            entity.setName(request.name().trim());
        }
        if (request.fileUrl() != null) {
            entity.setFileUrl(request.fileUrl());
        }
        if (request.textContent() != null) {
            entity.setTextContent(request.textContent());
        }
        if (request.isDefault() != null) {
            entity.setIsDefault(request.isDefault());
            if (Boolean.TRUE.equals(request.isDefault())) {
                resetOtherResumesDefault(userId);
            }
        }

        ResumeEntity saved = resumeRepository.save(entity);
        log.info("resumes.update userId={} id={} isDefault={}", userId, saved.getId(), saved.getIsDefault());
        return resumeMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ResumeResponse setAsDefault(UUID id) {
        UUID userId = currentUserResolver.resolveRequired().getId();
        ResumeEntity entity = findOwnedResume(id);

        if (!Boolean.TRUE.equals(entity.getIsDefault())) {
            resetOtherResumesDefault(userId);
            entity.setIsDefault(true);
            ResumeEntity saved = resumeRepository.save(entity);
            log.info("resumes.setAsDefault userId={} id={}", userId, saved.getId());
            return resumeMapper.toResponse(saved);
        }

        return resumeMapper.toResponse(entity);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        UUID userId = currentUserResolver.resolveRequired().getId();
        ResumeEntity entity = findOwnedResume(id);
        resumeRepository.delete(entity);
        log.info("resumes.delete userId={} id={}", userId, id);
    }

    private ResumeEntity findOwnedResume(UUID id) {
        UUID userId = currentUserResolver.resolveRequired().getId();
        return resumeRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new IllegalArgumentException("Resume not found"));
    }

    private void resetOtherResumesDefault(UUID userId) {
        List<ResumeEntity> defaultResumes = resumeRepository.findByUserIdAndIsDefaultTrue(userId);
        for (ResumeEntity resume : defaultResumes) {
            resume.setIsDefault(false);
        }
        if (!defaultResumes.isEmpty()) {
            resumeRepository.saveAll(defaultResumes);
        }
    }
}
