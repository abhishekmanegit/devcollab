package com.abhishek.devcollab.collaboration;

import com.abhishek.devcollab.dto.CollaborationRequestDTO;
import com.abhishek.devcollab.dto.PublicUserDTO;
import com.abhishek.devcollab.exception.ApiException;
import com.abhishek.devcollab.user.User;
import com.abhishek.devcollab.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static com.abhishek.devcollab.collaboration.CollaborationRequest.Status.ACCEPTED;
import static com.abhishek.devcollab.collaboration.CollaborationRequest.Status.DECLINED;
import static com.abhishek.devcollab.collaboration.CollaborationRequest.Status.PENDING;

@Service
@RequiredArgsConstructor
public class CollaborationService {

    private final CollaborationRequestRepository requestRepository;
    private final UserRepository userRepository;

    @Transactional
    public CollaborationRequestDTO send(String email, Long recipientId, String message) {

        User requester = requireUser(email);
        User recipient = requireUserById(recipientId);

        if (requester.getId().equals(recipient.getId())) {
            throw ApiException.badRequest("You cannot send a collaboration request to yourself");
        }

        if (requestRepository.countBetween(requester.getId(), recipient.getId(), ACCEPTED) > 0) {
            throw ApiException.conflict("You are already connected with this developer");
        }

        if (requestRepository.countBetween(requester.getId(), recipient.getId(), PENDING) > 0) {
            throw ApiException.conflict("A collaboration request is already pending");
        }

        CollaborationRequest saved = requestRepository.save(CollaborationRequest.builder()
                .requester(requester)
                .recipient(recipient)
                .message(message == null || message.isBlank() ? null : message.trim())
                .status(PENDING)
                .build());

        return toDto(saved, requester);
    }

    @Transactional
    public CollaborationRequestDTO accept(String email, Long requestId) {
        CollaborationRequest request = requireRequest(requestId);
        requireRecipient(request, email);
        requirePending(request);

        request.setStatus(ACCEPTED);
        request.setRespondedAt(java.time.LocalDateTime.now());
        return toDto(requestRepository.save(request), request.getRecipient());
    }

    @Transactional
    public CollaborationRequestDTO decline(String email, Long requestId) {
        CollaborationRequest request = requireRequest(requestId);
        requireRecipient(request, email);
        requirePending(request);

        request.setStatus(DECLINED);
        request.setRespondedAt(java.time.LocalDateTime.now());
        return toDto(requestRepository.save(request), request.getRecipient());
    }

    @Transactional(readOnly = true)
    public List<CollaborationRequestDTO> incoming(String email) {
        return requestRepository.findByRecipientOrderByCreatedAtDesc(requireUser(email)).stream()
                .map(request -> toDto(request, request.getRecipient()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CollaborationRequestDTO> outgoing(String email) {
        return requestRepository.findByRequesterOrderByCreatedAtDesc(requireUser(email)).stream()
                .map(request -> toDto(request, request.getRequester()))
                .toList();
    }

    @Transactional(readOnly = true)
    public long pendingCount(String email) {
        return requestRepository.countByRecipientAndStatus(requireUser(email), PENDING);
    }

    @Transactional(readOnly = true)
    public List<PublicUserDTO> connections(String email) {
        Long userId = requireUser(email).getId();

        Map<Long, User> byId = new LinkedHashMap<>();
        for (CollaborationRequest request : requestRepository.findAllBetween(userId, ACCEPTED)) {
            User other = request.getRequester().getId().equals(userId)
                    ? request.getRecipient()
                    : request.getRequester();
            byId.putIfAbsent(other.getId(), other);
        }

        return byId.values().stream()
                .map(this::toPublicUser)
                .toList();
    }

    @Transactional(readOnly = true)
    public boolean isConnected(Long a, Long b) {
        return requestRepository.countBetween(a, b, ACCEPTED) > 0;
    }

    /** Returns PENDING_IN when the viewer already asked this developer, PENDING_OUT when they asked the viewer. */
    @Transactional(readOnly = true)
    public String relationBetween(User viewer, Long otherId) {
        if (viewer.getId().equals(otherId)) {
            return "SELF";
        }
        if (requestRepository.countBetween(viewer.getId(), otherId, ACCEPTED) > 0) {
            return "CONNECTED";
        }
        if (requestRepository.countBetween(viewer.getId(), otherId, PENDING) > 0) {
            return outgoingPending(viewer.getId(), otherId) ? "PENDING_OUT" : "PENDING_IN";
        }
        return "NONE";
    }

    private boolean outgoingPending(Long viewerId, Long otherId) {
        return requestRepository
                .findByRequesterOrderByCreatedAtDesc(requireUserById(viewerId))
                .stream()
                .anyMatch(request -> request.getRecipient().getId().equals(otherId)
                        && request.getStatus() == PENDING);
    }

    private void requireRecipient(CollaborationRequest request, String email) {
        User current = requireUser(email);
        if (!request.getRecipient().getId().equals(current.getId())) {
            throw ApiException.forbidden("Only the developer who received this request can respond to it");
        }
    }

    private void requirePending(CollaborationRequest request) {
        if (request.getStatus() != PENDING) {
            throw ApiException.conflict("This request has already been " + request.getStatus().name().toLowerCase());
        }
    }

    private CollaborationRequest requireRequest(Long requestId) {
        return requestRepository.findById(requestId)
                .orElseThrow(() -> ApiException.notFound("Collaboration request not found"));
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }

    private User requireUserById(Long id) {
        if (id == null) {
            throw ApiException.badRequest("Recipient is required");
        }
        return userRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("That developer no longer exists"));
    }

    private CollaborationRequestDTO toDto(CollaborationRequest request, User viewer) {
        User other = request.getRequester().getId().equals(viewer.getId())
                ? request.getRecipient()
                : request.getRequester();

        return CollaborationRequestDTO.builder()
                .id(request.getId())
                .from(toPublicUser(other))
                .message(request.getMessage())
                .status(request.getStatus().name())
                .createdAt(request.getCreatedAt())
                .respondedAt(request.getRespondedAt())
                .build();
    }

    public PublicUserDTO toPublicUser(User user) {
        return PublicUserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .bio(user.getBio())
                .skills(splitSkills(user.getSkills()))
                .githubUrl(user.getGithubUrl())
                .profilePictureUrl(user.getProfilePictureUrl())
                .build();
    }

    private List<String> splitSkills(String skills) {
        if (skills == null || skills.isBlank()) {
            return List.of();
        }
        return Arrays.stream(skills.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }
}