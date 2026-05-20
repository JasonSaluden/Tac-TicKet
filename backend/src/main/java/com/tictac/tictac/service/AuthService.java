package com.tictac.tictac.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.tictac.tictac.dto.AuthResponse;
import com.tictac.tictac.dto.LoginRequest;
import com.tictac.tictac.dto.RegisterRequest;
import com.tictac.tictac.entity.RoleName;
import com.tictac.tictac.entity.User;
import com.tictac.tictac.repository.RoleRepository;
import com.tictac.tictac.repository.UserRepository;
import com.tictac.tictac.security.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = (User) auth.getPrincipal();
        String token = jwtUtil.generateToken(user.getIdUser(), user.getEmail(), user.getRole().getName().name());
        return buildAuthResponse(token, user);
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        var userRole = roleRepository.findByName(RoleName.USER)
                .orElseThrow(() -> new RuntimeException("Default role not found"));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(userRole)
                .build();

        user = userRepository.save(user);
        String token = jwtUtil.generateToken(user.getIdUser(), user.getEmail(), user.getRole().getName().name());
        return buildAuthResponse(token, user);
    }

    private AuthResponse buildAuthResponse(String token, User user) {
        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .userId(user.getIdUser())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole().getName().name())
                .build();
    }
}
