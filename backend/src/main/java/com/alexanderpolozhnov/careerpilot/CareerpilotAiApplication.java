package com.alexanderpolozhnov.careerpilot;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class CareerpilotAiApplication {

	static {
		// Разрешаем базовую аутентификацию для HTTPS-туннелей (иначе Java блокирует Basic авторизацию на CONNECT)
		System.setProperty("jdk.http.auth.tunneling.disabledSchemes", "");
		System.setProperty("jdk.http.auth.proxying.disabledSchemes", "");
	}

	public static void main(String[] args) {
		SpringApplication.run(CareerpilotAiApplication.class, args);
	}

}
