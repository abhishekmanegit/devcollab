package com.abhishek.devcollab.user;

import com.abhishek.devcollab.dto.UpdateProfileDTO;
import com.abhishek.devcollab.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;

@Service
public class UserService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    private static final long MAX_AVATAR_BYTES = 3L * 1024 * 1024;

    private final UserRepository userRepository;

    private final BCryptPasswordEncoder passwordEncoder;

    private final Path uploadRoot;

    public UserService(
            UserRepository userRepository,
            BCryptPasswordEncoder passwordEncoder,
            @Value("${app.upload.dir:uploads}") String uploadDir
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }

    @Transactional
    public User updateProfile(String email, UpdateProfileDTO dto) {
        User user = getByEmail(email);
        user.setBio(dto.getBio());
        List<String> skills = dto.getSkills();
        user.setSkills(skills == null ? "" : String.join(",", skills));
        user.setGithubUrl(normalizeGithubUrl(dto.getGithubUrl()));
        return userRepository.save(user);
    }

    @Transactional
    public User updateAvatar(String email, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw ApiException.badRequest("Please choose an image to upload");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw ApiException.badRequest("Only JPEG, PNG, WebP, or GIF images are allowed");
        }
        if (file.getSize() > MAX_AVATAR_BYTES) {
            throw ApiException.payloadTooLarge("Image must be 3MB or smaller");
        }

        User user = getByEmail(email);
        String ext = extensionFor(contentType);
        Path avatarDir = uploadRoot.resolve("avatars");
        try (var in = file.getInputStream()) {
            Files.createDirectories(avatarDir);
            Path destination = avatarDir.resolve("user-" + user.getId() + "." + ext);
            Files.copy(in, destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw ApiException.badRequest("Could not save profile picture");
        }

        user.setProfilePictureUrl("/api/uploads/avatars/user-" + user.getId() + "." + ext + "?v=" + System.currentTimeMillis());
        return userRepository.save(user);
    }

    private String extensionFor(String contentType) {
        return switch (contentType) {
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            case "image/gif" -> "gif";
            default -> "jpg";
        };
    }

    private String normalizeGithubUrl(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            return trimmed;
        }
        String handle = trimmed.replaceFirst("^@", "").replaceFirst("(?i)^github\\.com/", "");
        return "https://github.com/" + handle;
    }

}