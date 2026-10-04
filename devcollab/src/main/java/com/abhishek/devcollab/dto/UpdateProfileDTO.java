package com.abhishek.devcollab.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdateProfileDTO {

    @Size(max = 1000, message = "Bio must be at most 1000 characters")
    private String bio;

    private List<String> skills;

    @Size(max = 200, message = "GitHub URL must be at most 200 characters")
    private String githubUrl;
}