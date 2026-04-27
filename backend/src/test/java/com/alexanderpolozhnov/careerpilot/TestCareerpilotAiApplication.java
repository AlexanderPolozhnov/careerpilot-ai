package com.alexanderpolozhnov.careerpilot;

import org.springframework.boot.SpringApplication;

public class TestCareerpilotAiApplication {

	public static void main(String[] args) {
		SpringApplication.from(CareerpilotAiApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
