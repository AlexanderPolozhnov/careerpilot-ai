package com.alexanderpolozhnov.careerpilot.auth.service;
import org.springframework.stereotype.Service;
@Service public class JwtService { public String generateToken(String subject){ return "token-for-" + subject; } }
