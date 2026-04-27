package com.alexanderpolozhnov.careerpilot.common.entity;

import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@MappedSuperclass
public abstract class BaseUuidEntity {

    @Id
    private UUID id;

    @PrePersist
    protected void ensureId() {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }
}
