package com.abhishek.devcollab.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProjectResponseDTO {

    private Long id;
    private String title;
    private String description;
    private String creatorName;
    private String creatorEmail;
    private long memberCount;
    private boolean joined;
    private boolean owner;
}
