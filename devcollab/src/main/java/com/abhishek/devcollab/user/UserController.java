package com.abhishek.devcollab.user;

import com.abhishek.devcollab.dto.UserProfileDTO;
import com.abhishek.devcollab.dto.UserResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.abhishek.devcollab.dto.UpdateProfileDTO;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    // CREATE USER (optional now)
    @PostMapping
    public UserResponseDTO createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    // GET ALL USERS
    @GetMapping
    public List<UserResponseDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    // 🔥 GET CURRENT USER PROFILE
    @GetMapping("/me")
    public User getProfile(Authentication authentication) {

        String email = authentication.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }


    @PutMapping("/update")
    public String updateProfile(
            Authentication authentication,
            @RequestBody UpdateProfileDTO dto
    ) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setBio(dto.getBio());

        user.setSkills(String.join(",", dto.getSkills()));;

        userRepository.save(user);

        return "Profile updated";
    }
}