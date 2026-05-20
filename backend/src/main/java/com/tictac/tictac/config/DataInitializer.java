package com.tictac.tictac.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import com.tictac.tictac.entity.Role;
import com.tictac.tictac.entity.RoleName;
import com.tictac.tictac.repository.RoleRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(ApplicationArguments args) {
        for (RoleName name : RoleName.values()) {
            if (roleRepository.findByName(name).isEmpty()) {
                roleRepository.save(Role.builder().name(name).build());
            }
        }
    }
}
