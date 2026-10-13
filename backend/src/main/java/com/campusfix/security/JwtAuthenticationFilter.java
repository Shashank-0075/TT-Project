package com.campusfix.security;

import com.campusfix.util.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Runs once for every request, BEFORE the controller.
 *
 * Steps:
 *  1. Read the header   Authorization: Bearer <token>
 *  2. Validate the token (signature + expiry)
 *  3. Load the user from the database (so a deactivated user is blocked immediately)
 *  4. Put the user into the SecurityContext - from now on Spring knows who is calling
 *
 * If the token is bad we do NOT stop here. We just remember the reason and let the request continue
 * without authentication. Spring Security then rejects it with 401 (JwtAuthenticationEntryPoint)
 * for protected URLs.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    /** Request attribute used to pass the failure reason to the entry point. */
    public static final String ERROR_ATTRIBUTE = "campusfix.jwt.error";

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, CustomUserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            try {
                Claims claims = jwtUtil.parseToken(token);
                UserDetails user = userDetailsService.loadUserByUsername(claims.getSubject());

                if (!user.isEnabled()) {
                    request.setAttribute(ERROR_ATTRIBUTE, "Your account has been deactivated.");
                } else if (SecurityContextHolder.getContext().getAuthentication() == null) {
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (ExpiredJwtException ex) {
                request.setAttribute(ERROR_ATTRIBUTE, "Your session has expired. Please log in again.");
            } catch (JwtException | IllegalArgumentException | UsernameNotFoundException ex) {
                request.setAttribute(ERROR_ATTRIBUTE, "Invalid authentication token. Please log in again.");
            }
        }

        chain.doFilter(request, response);
    }
}
