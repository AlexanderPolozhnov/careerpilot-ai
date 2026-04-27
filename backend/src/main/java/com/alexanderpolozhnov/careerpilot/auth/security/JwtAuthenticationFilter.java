package com.alexanderpolozhnov.careerpilot.auth.security;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
@Component public class JwtAuthenticationFilter extends OncePerRequestFilter { protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException { filterChain.doFilter(request, response);} }
