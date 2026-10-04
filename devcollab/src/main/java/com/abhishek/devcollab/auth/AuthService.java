package com.abhishek.devcollab.auth;

import com.abhishek.devcollab.config.JwtUtil;
import com.abhishek.devcollab.dto.LoginRequestDTO;
import com.abhishek.devcollab.dto.RegisterRequestDTO;
import com.abhishek.devcollab.exception.ApiException;
import com.abhishek.devcollab.user.User;
import com.abhishek.devcollab.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder passwordEncoder;

    @Transactional
    public String register(RegisterRequestDTO request) {

        String email = normalizeEmail(request.getEmail());

        if (userRepository.findByEmail(email).isPresent()) {
            throw ApiException.conflict("An account with this email already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setName(request.getName().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);

        return "User registered successfully";
    }

    public String login(LoginRequestDTO request) {

        String email = normalizeEmail(request.getEmail());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.unauthorized("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw ApiException.unauthorized("Invalid email or password");
        }

        return jwtUtil.generateToken(user.getEmail());
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}