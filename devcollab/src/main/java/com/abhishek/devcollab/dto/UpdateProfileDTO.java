package com.abhishek.devcollab.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdateProfileDTO {

    private String bio;

    private List<String> skills;
}