package com.alexanderpolozhnov.careerpilot.auth.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TelegramWebAppAuthRequest {
    @NotBlank(message = "Init data is required")
    private String initData;
}
