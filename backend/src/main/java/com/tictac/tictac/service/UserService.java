package com.tictac.tictac.service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tictac.tictac.entity.RoleName;
import com.tictac.tictac.entity.User;
import com.tictac.tictac.repository.RoleRepository;
import com.tictac.tictac.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public List<Long> getCategoryIds(Long userId) {
        return userRepository.findCategoryIdsByUserId(userId);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> getUsersByRole(RoleName roleName) {
        return userRepository.findByRole_Name(roleName);
    }

    public User updateUser(Long id, User updates) {
        return userRepository.findById(id).map(user -> {
            if (updates.getFirstName() != null) user.setFirstName(updates.getFirstName());
            if (updates.getLastName() != null) user.setLastName(updates.getLastName());
            if (updates.getEmail() != null) user.setEmail(updates.getEmail());
            if (updates.getPassword() != null) user.setPassword(passwordEncoder.encode(updates.getPassword()));
            if (updates.getRole() != null) user.setRole(updates.getRole());
            return userRepository.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
