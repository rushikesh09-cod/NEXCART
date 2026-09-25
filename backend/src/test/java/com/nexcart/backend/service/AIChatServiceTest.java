package com.nexcart.backend.service;

import com.nexcart.backend.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class AIChatServiceTest {

    @Mock
    private ProductRepository productRepository;

    private AIChatService aiChatService;

    @BeforeEach
    void setUp() {
        // Instantiate without OpenAIClient to test resilient fallback behavior
        aiChatService = new AIChatService(null, "gpt-4o-mini", productRepository);
    }

    @Test
    @DisplayName("Should return welcome greeting for greeting messages")
    void shouldReturnGreetingForHello() {
        String response = aiChatService.getAIResponse("Hello");
        assertNotNull(response);
        assertTrue(response.contains("Welcome to NEXCART"), "Response should contain welcome message");
    }

    @Test
    @DisplayName("Should return delivery information when asked about shipping")
    void shouldReturnDeliveryInfo() {
        String response = aiChatService.getAIResponse("What is your delivery time and shipping policy?");
        assertNotNull(response);
        assertTrue(response.contains("Delivery Information"), "Response should contain delivery information");
        assertTrue(response.contains("Free Shipping"), "Response should mention free shipping policy");
    }

    @Test
    @DisplayName("Should return order tracking instructions when asked about tracking")
    void shouldReturnOrderTrackingInfo() {
        String response = aiChatService.getAIResponse("Where is my order and how do I track it?");
        assertNotNull(response);
        assertTrue(response.contains("Order Tracking"), "Response should explain order tracking");
        assertTrue(response.contains("My Orders"), "Response should mention My Orders page");
    }

    @Test
    @DisplayName("Should return return policy when asked about refunds")
    void shouldReturnRefundPolicy() {
        String response = aiChatService.getAIResponse("What is the return and refund policy?");
        assertNotNull(response);
        assertTrue(response.contains("Returns & Cancellation"), "Response should explain returns policy");
    }

    @Test
    @DisplayName("Should return payment methods when asked about how to pay")
    void shouldReturnPaymentMethods() {
        String response = aiChatService.getAIResponse("What payment methods do you accept?");
        assertNotNull(response);
        assertTrue(response.contains("Accepted Payment Methods"), "Response should list payment options");
    }

    @Test
    @DisplayName("Should return contact support details when asked for help")
    void shouldReturnSupportDetails() {
        String response = aiChatService.getAIResponse("I need customer support contact details");
        assertNotNull(response);
        assertTrue(response.contains("admin@nexcart.com"), "Response should include support email");
    }
}
