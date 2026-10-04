package com.abhishek.devcollab.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

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

    @Builder.Default
    private List<String> skills = new ArrayList<>();
}