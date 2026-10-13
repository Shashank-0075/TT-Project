package com.campusfix.util;

import com.campusfix.security.UserPrincipal;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Creates and validates JSON Web Tokens (JWT).
 *
 * A JWT has three parts: header.payload.signature
 *  - payload (claims): who the user is (email), role, issue time and expiry time
 *  - signature: made with our secret key, so nobody can change the payload without being detected
 *
 * The secret comes from the JWT_SECRET environment variable - it is never written in the code.
 */
@Component
public class JwtUtil {

    private final SecretKey key;
    private final long expirationMs;

    public JwtUtil(@Value("${campusfix.jwt.secret}") String secret,
                   @Value("${campusfix.jwt.expiration-ms}") long expirationMs) {
        if (secret == null || secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET must be set and be at least 32 characters long (see backend/.env.example)");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public long getExpirationMs() {
        return expirationMs;
    }

    /** Builds a signed token for the given user. */
    public String generateToken(UserPrincipal user) {
        Date now = new Date();
        return Jwts.builder()
                .subject(user.getUsername())           // the email
                .claim("uid", user.getId())
                .claim("role", user.getRoleName())
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(key)
                .compact();
    }

    /**
     * Verifies the signature and expiry and returns the claims.
     * Throws a JwtException (ExpiredJwtException, SignatureException, MalformedJwtException ...)
     * if the token is invalid.
     */
    public Claims parseToken(String token) throws JwtException {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
