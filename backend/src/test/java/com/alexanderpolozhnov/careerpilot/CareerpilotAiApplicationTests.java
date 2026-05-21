package com.alexanderpolozhnov.careerpilot;

import com.alexanderpolozhnov.careerpilot.notification.service.EmailService;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

@Import(TestcontainersConfiguration.class)
@SpringBootTest
@ActiveProfiles("test")
class CareerpilotAiApplicationTests {

	@MockBean
	private EmailService emailService;

	@Test
	void contextLoads() {
	}

}
