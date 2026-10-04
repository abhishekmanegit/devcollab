package com.abhishek.devcollab.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommentResponseDTO {

    private Long id;
    private String content;
    private String authorName;
    private String authorGithubUrl;
    private String authorAvatarUrl;
    private LocalDateTime createdAt;
}