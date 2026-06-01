package com.kaoyanbuddy.service;

import com.kaoyanbuddy.domain.UserAccount;
import com.kaoyanbuddy.exception.ResourceNotFoundException;
import com.kaoyanbuddy.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserAccount getByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("用户不存在"));
    }
}
