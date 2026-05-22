package com.tictac.tictac.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tictac.tictac.dto.ChangePasswordRequest;
import com.tictac.tictac.dto.UserDTO;
import com.tictac.tictac.entity.RoleName;
import com.tictac.tictac.entity.User;
import com.tictac.tictac.repository.RoleRepository;
import com.tictac.tictac.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final RoleRepository roleRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers().stream()
                .map(this::toDTO).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.idUser")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(u -> ResponseEntity.ok(toDTO(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/agents")
    @PreAuthorize("hasRole('ADMIN') or hasRole('AGENT')")
    public ResponseEntity<List<UserDTO>> getAgents() {
        return ResponseEntity.ok(userService.getUsersByRole(RoleName.AGENT).stream()
                .map(this::toDTO).collect(Collectors.toList()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.idUser")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long id,
            @RequestBody UserDTO dto,
            @AuthenticationPrincipal User requester
    ) {
        User.UserBuilder builder = User.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail());

        // Only admins can change roles
        if (dto.getRole() != null && requester.getRole().getName() == RoleName.ADMIN) {
            RoleName roleName = RoleName.valueOf(dto.getRole());
            roleRepository.findByName(roleName).ifPresent(builder::role);
        }

        return ResponseEntity.ok(toDTO(userService.updateUser(id, builder.build())));
    }

    @PatchMapping("/{id}/categories")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.idUser")
    public ResponseEntity<List<Long>> updateCategories(
            @PathVariable Long id,
            @RequestBody Map<String, List<Long>> body) {
        List<Long> updated = userService.updateCategories(id, body.get("categoryIds"));
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/change-password")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.idUser")
    public ResponseEntity<UserDTO> changePassword(
            @PathVariable Long id,
            @RequestBody ChangePasswordRequest request
    ) {
        return ResponseEntity.ok(toDTO(userService.changePassword(id, request.getCurrentPassword(), request.getNewPassword())));
    }

    private UserDTO toDTO(User user) {
        return UserDTO.builder()
                .idUser(user.getIdUser())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole().getName().name())
                .oauthProvider(user.getOauthProvider())
                .createdAt(user.getCreatedAt())
                .categoryIds(userService.getCategoryIds(user.getIdUser()))
                .build();
    }
}
