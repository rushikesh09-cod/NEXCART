package com.nexcart.backend.service;

import com.nexcart.backend.dto.LoginRequest;
import com.nexcart.backend.dto.RegisterRequest;
import com.nexcart.backend.entity.Role;
import com.nexcart.backend.entity.User;
import com.nexcart.backend.repository.RoleRepository;
import com.nexcart.backend.repository.UserRepository;
import com.nexcart.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private Role customerRole;
    private User activeUser;

    @BeforeEach
    void setUp() {
        customerRole = new Role();
        customerRole.setId(UUID.randomUUID());
        customerRole.setName("CUSTOMER");

        activeUser = new User();
        activeUser.setId(UUID.randomUUID());
        activeUser.setFirstName("Rushi");
        activeUser.setLastName("Patil");
        activeUser.setEmail("rushi@example.com");
        activeUser.setPasswordHash("encodedPassword");
        activeUser.setPhone("9876543210");
        activeUser.setStatus("ACTIVE");
        activeUser.setRoles(Set.of(customerRole));
    }

    private RegisterRequest createRegisterRequest(
            String firstName,
            String lastName,
            String email,
            String password,
            String phone
    ) {
        RegisterRequest request = new RegisterRequest();

        request.setFirstName(firstName);
        request.setLastName(lastName);
        request.setEmail(email);
        request.setPassword(password);
        request.setPhone(phone);

        return request;
    }

    private LoginRequest createLoginRequest(
            String email,
            String password
    ) {
        LoginRequest request = new LoginRequest();

        request.setEmail(email);
        request.setPassword(password);

        return request;
    }

    @Test
    void register_shouldCreateCustomerSuccessfully() {

        RegisterRequest request = createRegisterRequest(
                "Rushi",
                "Patil",
                "rushi@example.com",
                "Password123",
                "9876543210"
        );

        when(userRepository.existsByEmail("rushi@example.com"))
                .thenReturn(false);

        when(userRepository.existsByPhone("9876543210"))
                .thenReturn(false);

        when(roleRepository.findByNameIgnoreCase("CUSTOMER"))
                .thenReturn(Optional.of(customerRole));

        when(passwordEncoder.encode("Password123"))
                .thenReturn("encodedPassword");

        when(userRepository.save(any(User.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        User result = authService.register(request);

        assertNotNull(result);
        assertEquals("Rushi", result.getFirstName());
        assertEquals("Patil", result.getLastName());
        assertEquals("rushi@example.com", result.getEmail());
        assertEquals("encodedPassword", result.getPasswordHash());
        assertEquals("9876543210", result.getPhone());
        assertEquals("ACTIVE", result.getStatus());

        assertNotNull(result.getRoles());
        assertTrue(result.getRoles().contains(customerRole));

        verify(userRepository).save(any(User.class));
        verify(passwordEncoder).encode("Password123");
    }

    @Test
    void register_shouldRejectDuplicateEmail() {

        RegisterRequest request = createRegisterRequest(
                "Rushi",
                "Patil",
                "rushi@example.com",
                "Password123",
                "9876543210"
        );

        when(userRepository.existsByEmail("rushi@example.com"))
                .thenReturn(true);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> authService.register(request)
        );

        assertEquals(
                "Email already registered",
                exception.getMessage()
        );

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void register_shouldRejectDuplicatePhone() {

        RegisterRequest request = createRegisterRequest(
                "Rushi",
                "Patil",
                "new@example.com",
                "Password123",
                "9876543210"
        );

        when(userRepository.existsByEmail("new@example.com"))
                .thenReturn(false);

        when(userRepository.existsByPhone("9876543210"))
                .thenReturn(true);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> authService.register(request)
        );

        assertEquals(
                "Phone already registered",
                exception.getMessage()
        );

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_shouldReturnTokenForValidCredentials() {

        LoginRequest request = createLoginRequest(
                "rushi@example.com",
                "Password123"
        );

        when(userRepository.findByEmail("rushi@example.com"))
                .thenReturn(Optional.of(activeUser));

        when(passwordEncoder.matches(
                "Password123",
                "encodedPassword"
        )).thenReturn(true);

        when(jwtService.generateToken(
                activeUser.getId(),
                activeUser.getEmail()
        )).thenReturn("jwt-token");

        AuthService.LoginResult result =
                authService.login(request);

        assertNotNull(result);
        assertEquals(activeUser, result.user());
        assertEquals("jwt-token", result.token());

        verify(jwtService).generateToken(
                activeUser.getId(),
                activeUser.getEmail()
        );
    }

    @Test
    void login_shouldRejectUnknownEmail() {

        LoginRequest request = createLoginRequest(
                "unknown@example.com",
                "Password123"
        );

        when(userRepository.findByEmail("unknown@example.com"))
                .thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> authService.login(request)
        );

        assertEquals(
                "Invalid email or password",
                exception.getMessage()
        );

        verify(passwordEncoder, never())
                .matches(anyString(), anyString());

        verify(jwtService, never())
                .generateToken(any(UUID.class), anyString());
    }

    @Test
    void login_shouldRejectWrongPassword() {

        LoginRequest request = createLoginRequest(
                "rushi@example.com",
                "WrongPassword"
        );

        when(userRepository.findByEmail("rushi@example.com"))
                .thenReturn(Optional.of(activeUser));

        when(passwordEncoder.matches(
                "WrongPassword",
                "encodedPassword"
        )).thenReturn(false);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> authService.login(request)
        );

        assertEquals(
                "Invalid email or password",
                exception.getMessage()
        );

        verify(jwtService, never())
                .generateToken(any(UUID.class), anyString());
    }

    @Test
    void login_shouldRejectInactiveAccount() {

        activeUser.setStatus("INACTIVE");

        LoginRequest request = createLoginRequest(
                "rushi@example.com",
                "Password123"
        );

        when(userRepository.findByEmail("rushi@example.com"))
                .thenReturn(Optional.of(activeUser));

        when(passwordEncoder.matches(
                "Password123",
                "encodedPassword"
        )).thenReturn(true);

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> authService.login(request)
        );

        assertEquals(
                "User account is not active",
                exception.getMessage()
        );

        verify(jwtService, never())
                .generateToken(any(UUID.class), anyString());
    }

    @Test
    void login_shouldRejectUserWithoutRole() {

        activeUser.setRoles(Set.of());

        LoginRequest request = createLoginRequest(
                "rushi@example.com",
                "Password123"
        );

        when(userRepository.findByEmail("rushi@example.com"))
                .thenReturn(Optional.of(activeUser));

        when(passwordEncoder.matches(
                "Password123",
                "encodedPassword"
        )).thenReturn(true);

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> authService.login(request)
        );

        assertEquals(
                "User has no assigned role",
                exception.getMessage()
        );

        verify(jwtService, never())
                .generateToken(any(UUID.class), anyString());
    }
}