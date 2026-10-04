package com.abhishek.devcollab.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProjectSummaryDTO {

    private Long id;
    private String title;
    private String description;
    private long memberCount;
    private List<String> skills;
}
