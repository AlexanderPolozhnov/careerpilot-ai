package com.alexanderpolozhnov.careerpilot.application.event;

import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationEntity;
import com.alexanderpolozhnov.careerpilot.application.entity.ApplicationStatus;
import com.alexanderpolozhnov.careerpilot.notification.entity.NotificationType;
import com.alexanderpolozhnov.careerpilot.notification.service.NotificationCreator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class ApplicationEventListener {

    private final NotificationCreator notificationCreator;

    @Async
    @EventListener
    public void handleApplicationStatusChanged(ApplicationStatusChangedEvent event) {
        ApplicationEntity application = event.getApplication();
        ApplicationStatus newStatus = event.getNewStatus();

        if (newStatus == ApplicationStatus.SAVED) {
            return;
        }

        log.info("Handling ApplicationStatusChangedEvent for application id={}", application.getId());

        String vacancyTitle = application.getVacancy().getTitle();
        String companyName = application.getVacancy().getCompany() != null 
                ? application.getVacancy().getCompany().getName() 
                : "Unknown";
        
        String message = String.format("Статус вашего отклика на вакансию %s в %s изменен на %s",
                vacancyTitle, companyName, newStatus.name());

        notificationCreator.createNotification(
                application.getUser(),
                NotificationType.APPLICATION_STATUS,
                "Обновление статуса отклика",
                message,
                application.getId(),
                "APPLICATION",
                false
        );
    }
}
