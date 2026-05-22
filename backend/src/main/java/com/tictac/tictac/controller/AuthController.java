package com.tictac.tictac.controller;

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
import com.tictac.tictac.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> me(@AuthenticationPrincipal User principal) {
        UserDTO dto = UserDTO.builder()
                .idUser(principal.getIdUser())
                .firstName(principal.getFirstName())
                .lastName(principal.getLastName())
                .email(principal.getEmail())
                .role(principal.getRole().getName().name())
                .oauthProvider(principal.getOauthProvider())
                .createdAt(principal.getCreatedAt())
                .categoryIds(userService.getCategoryIds(principal.getIdUser()))
                .build();
        return ResponseEntity.ok(dto);
    }
}
