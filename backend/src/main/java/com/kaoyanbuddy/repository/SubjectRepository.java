package com.kaoyanbuddy.repository;

import com.kaoyanbuddy.domain.Subject;
import com.kaoyanbuddy.domain.UserAccount;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository extends JpaRepository<Subject, Long> {

    List<Subject> findByUserOrderByCreatedAtAsc(UserAccount user);

    Optional<Subject> findByIdAndUser(Long id, UserAccount user);

    boolean existsByIdAndUser(Long id, UserAccount user);
}
