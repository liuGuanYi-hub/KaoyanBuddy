package com.kaoyanbuddy.service;

import com.kaoyanbuddy.domain.UserAccount;
import com.kaoyanbuddy.dto.AuthResponse;
import com.kaoyanbuddy.dto.LoginRequest;
import com.kaoyanbuddy.dto.RegisterRequest;
import com.kaoyanbuddy.dto.UserResponse;
import com.kaoyanbuddy.exception.BadRequestException;
import com.kaoyanbuddy.repository.UserRepository;
import com.kaoyanbuddy.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String username = request.username().trim();
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByUsername(username)) {
            throw new BadRequestException("用户名已被使用");
        }
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("邮箱已被使用");
        }

        UserAccount user = userRepository.save(new UserAccount(
                username,
                email,
                passwordEncoder.encode(request.password())
        ));
        return new AuthResponse(jwtService.generateToken(user), UserResponse.from(user));
    }

    public AuthResponse login(LoginRequest request) {
        String username = request.username().trim();
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                username,
                request.password()
        ));
        UserAccount user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadRequestException("用户不存在"));
        return new AuthResponse(jwtService.generateToken(user), UserResponse.from(user));
    }
}
