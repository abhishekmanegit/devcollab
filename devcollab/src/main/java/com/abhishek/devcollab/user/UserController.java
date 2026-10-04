package com.abhishek.devcollab.user;

import com.abhishek.devcollab.dto.UpdateProfileDTO;
import com.abhishek.devcollab.dto.UserResponseDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public UserResponseDTO createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @GetMapping
    public List<UserResponseDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/me")
    public User getProfile(Authentication authentication) {
        return userService.getByEmail(authentication.getName());
    }

    @PutMapping("/update")
    public User updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileDTO dto
    ) {
        return userService.updateProfile(authentication.getName(), dto);
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public User uploadAvatar(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) {
        return userService.updateAvatar(authentication.getName(), file);
    }
}