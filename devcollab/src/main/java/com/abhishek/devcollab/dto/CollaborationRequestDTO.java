package com.abhishek.devcollab.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CollaborationRequestDTO {

    private Long id;
    private PublicUserDTO from;
    private String message;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime respondedAt;
}
