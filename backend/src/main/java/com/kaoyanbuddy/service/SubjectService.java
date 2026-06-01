package com.kaoyanbuddy.service;

import com.kaoyanbuddy.domain.Subject;
import com.kaoyanbuddy.domain.UserAccount;
import com.kaoyanbuddy.dto.SubjectRequest;
import com.kaoyanbuddy.dto.SubjectResponse;
import com.kaoyanbuddy.exception.ResourceNotFoundException;
import com.kaoyanbuddy.repository.StudyTaskRepository;
import com.kaoyanbuddy.repository.SubjectRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final StudyTaskRepository taskRepository;

    public SubjectService(SubjectRepository subjectRepository, StudyTaskRepository taskRepository) {
        this.subjectRepository = subjectRepository;
        this.taskRepository = taskRepository;
    }

    public List<SubjectResponse> list(UserAccount user) {
        return subjectRepository.findByUserOrderByCreatedAtAsc(user)
                .stream()
                .map(SubjectResponse::from)
                .toList();
    }

    @Transactional
    public SubjectResponse create(UserAccount user, SubjectRequest request) {
        Subject subject = subjectRepository.save(new Subject(
                user,
                request.name().trim(),
                request.category().trim(),
                request.color(),
                request.targetHours() == null ? 120 : request.targetHours()
        ));
        return SubjectResponse.from(subject);
    }

    @Transactional
    public SubjectResponse update(UserAccount user, Long id, SubjectRequest request) {
        Subject subject = getSubject(user, id);
        subject.update(
                request.name().trim(),
                request.category().trim(),
                request.color(),
                request.targetHours() == null ? subject.getTargetHours() : request.targetHours()
        );
        return SubjectResponse.from(subject);
    }

    @Transactional
    public void delete(UserAccount user, Long id) {
        Subject subject = getSubject(user, id);
        taskRepository.deleteBySubjectAndUser(subject, user);
        subjectRepository.delete(subject);
    }

    public Subject getSubject(UserAccount user, Long id) {
        return subjectRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("科目不存在"));
    }
}
