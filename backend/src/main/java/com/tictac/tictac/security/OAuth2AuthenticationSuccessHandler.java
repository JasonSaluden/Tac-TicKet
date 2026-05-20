package com.tictac.tictac.security;

import java.io.IOException;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.tictac.tictac.entity.RoleName;
import com.tictac.tictac.entity.User;
import com.tictac.tictac.repository.RoleRepository;
import com.tictac.tictac.repository.UserRepository;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String firstName = oAuth2User.getAttribute("given_name");
        String lastName = oAuth2User.getAttribute("family_name");

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            var userRole = roleRepository.findByName(RoleName.USER)
                    .orElseThrow(() -> new RuntimeException("Default role not found"));
            return userRepository.save(User.builder()
                    .email(email)
                    .firstName(firstName)
                    .lastName(lastName)
                    .role(userRole)
                    .build());
        });

        String token = jwtUtil.generateToken(
                user.getIdUser(),
                user.getEmail(),
                user.getRole().getName().name()
        );

        getRedirectStrategy().sendRedirect(request, response, frontendUrl + "/oauth2/callback?token=" + token);
    }
}
