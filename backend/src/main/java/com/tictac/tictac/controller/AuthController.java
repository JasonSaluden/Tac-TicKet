package com.tictac.tictac.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tictac.tictac.dto.AuthResponse;
import com.tictac.tictac.dto.LoginRequest;
import com.tictac.tictac.dto.RegisterRequest;
import com.tictac.tictac.dto.UserDTO;
import com.tictac.tictac.entity.User;
import com.tictac.tictac.service.AuthService;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> me(@AuthenticationPrincipal User user) {
        UserDTO dto = UserDTO.builder()
                .idUser(user.getIdUser())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().getName().name())
                .createdAt(user.getCreatedAt())
                .build();
        return ResponseEntity.ok(dto);
    }
}
