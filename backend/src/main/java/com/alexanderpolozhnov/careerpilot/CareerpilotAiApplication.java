package com.alexanderpolozhnov.careerpilot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class CareerpilotAiApplication {

	public static void main(String[] args) {
		SpringApplication.run(CareerpilotAiApplication.class, args);
	}

}
