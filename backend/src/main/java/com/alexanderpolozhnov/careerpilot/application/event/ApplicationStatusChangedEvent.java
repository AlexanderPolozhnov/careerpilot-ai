package com.alexanderpolozhnov.careerpilot.application.event;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationEntity;
import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationStatus;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

@Getter
public class ApplicationStatusChangedEvent extends ApplicationEvent {
    private final ApplicationEntity application;
    private final ApplicationStatus oldStatus;
    private final ApplicationStatus newStatus;

    public ApplicationStatusChangedEvent(Object source, ApplicationEntity application, 
                                        ApplicationStatus oldStatus, ApplicationStatus newStatus) {
        super(source);
        this.application = application;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
    }
}
