package com.abhishek.devcollab.user;

import com.abhishek.devcollab.dto.PublicProfileDTO;
import com.abhishek.devcollab.dto.PublicUserDTO;
import com.abhishek.devcollab.dto.UpdateProfileDTO;
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
    private final UserDirectoryService directoryService;

    @GetMapping("/me")
    public User getProfile(Authentication authentication) {
        return userService.getByEmail(authentication.getName());
    }

    /** Searches other developers by name, skills or bio. Never returns email addresses. */
    @GetMapping("/search")
    public List<PublicUserDTO> search(@RequestParam("q") String q, Authentication authentication) {
        return directoryService.search(authentication.getName(), q);
    }

    @GetMapping("/{id}")
    public PublicProfileDTO publicProfile(@PathVariable Long id, Authentication authentication) {
        return directoryService.profile(authentication.getName(), id);
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
