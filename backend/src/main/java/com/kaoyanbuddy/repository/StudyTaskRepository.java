package com.kaoyanbuddy.repository;

import com.kaoyanbuddy.domain.StudyTask;
import com.kaoyanbuddy.domain.Subject;
import com.kaoyanbuddy.domain.TaskStatus;
import com.kaoyanbuddy.domain.UserAccount;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudyTaskRepository extends JpaRepository<StudyTask, Long> {

    Optional<StudyTask> findByIdAndUser(Long id, UserAccount user);

    List<StudyTask> findByUserOrderByTaskDateAscCreatedAtAsc(UserAccount user);

    List<StudyTask> findByUserAndTaskDateBetweenOrderByTaskDateAscCreatedAtAsc(UserAccount user, LocalDate start, LocalDate end);

    List<StudyTask> findByUserAndTaskDateOrderByCreatedAtAsc(UserAccount user, LocalDate taskDate);

    List<StudyTask> findByUserAndStatusOrderByTaskDateAscCreatedAtAsc(UserAccount user, TaskStatus status);

    List<StudyTask> findByUserAndSubjectOrderByTaskDateAscCreatedAtAsc(UserAccount user, Subject subject);

    List<StudyTask> findByUserAndTaskDateAndStatusOrderByCreatedAtAsc(UserAccount user, LocalDate taskDate, TaskStatus status);

    List<StudyTask> findByUserAndTaskDateAndSubjectOrderByCreatedAtAsc(UserAccount user, LocalDate taskDate, Subject subject);

    boolean existsByUserAndSubjectAndTaskDateAndTitle(UserAccount user, Subject subject, LocalDate taskDate, String title);

    void deleteBySubjectAndUser(Subject subject, UserAccount user);
}
