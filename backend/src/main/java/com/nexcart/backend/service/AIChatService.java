
package com.nexcart.backend.service;

import com.nexcart.backend.entity.Product;
import com.nexcart.backend.repository.ProductRepository;
import com.openai.client.OpenAIClient;
import com.openai.models.responses.Response;
import com.openai.models.responses.ResponseCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AIChatService {

    private static final Logger log = LoggerFactory.getLogger(AIChatService.class);

    private final OpenAIClient openAIClient;
    private final String model;
    private final ProductRepository productRepository;

    public AIChatService(
            @Autowired(required = false) OpenAIClient openAIClient,
            @Value("${openai.model:gpt-4o-mini}") String model,
            @Autowired(required = false) ProductRepository productRepository
    ) {
        this.openAIClient = openAIClient;
        this.model = model;
        this.productRepository = productRepository;
    }

    public String getAIResponse(String userMessage) {
        if (userMessage == null || userMessage.isBlank()) {
            return "Hello! How can I assist you with your shopping at NEXCART today?";
        }

        // Attempt OpenAI response if client is available
        if (openAIClient != null) {
            try {
                String systemInstructions = buildSystemInstructions();
                String prompt = systemInstructions
                        + "\n\nCustomer message:\n"
                        + userMessage.trim();

                ResponseCreateParams params = ResponseCreateParams.builder()
                        .model(model)
                        .input(prompt)
                        .build();

                Response response = openAIClient.responses().create(params);

                String result = response.output()
                        .stream()
                        .flatMap(item -> item.message().stream())
                        .flatMap(message -> message.content().stream())
                        .flatMap(content -> content.outputText().stream())
                        .map(outputText -> outputText.text())
                        .reduce("", String::concat);

                if (result != null && !result.isBlank()) {
                    return result.trim();
                }
            } catch (Exception e) {
                log.warn("OpenAI API call failed or unavailable ({}). Falling back to internal store assistant.", e.getMessage());
            }
        }

        // Graceful fallback to domain assistant
        return generateFallbackResponse(userMessage.trim());
    }

    private String buildSystemInstructions() {
        StringBuilder sb = new StringBuilder("""
                You are NEXCART's friendly and helpful AI Customer Shopping Assistant.

                About NEXCART:
                - NEXCART is a premier modern e-commerce platform offering quality products across electronics, fashion, home essentials, and more.
                - Free standard delivery on orders above ₹499. Standard shipping arrives in 3-5 business days.
                - Easy 7-day return and exchange policy for unused items in original packaging.
                - Orders can be tracked or cancelled directly in the 'My Orders' section.
                - Secure payment options: Razorpay, Credit/Debit cards, UPI, Net Banking, and Cash on Delivery (COD).
                - Customer support email: admin@nexcart.com.

                Guidelines:
                - Be concise, polite, enthusiastic, and helpful.
                - Format lists with bullet points and bold text where appropriate for readability.
                - If you do not know the exact answer, offer to connect them with customer support at admin@nexcart.com.
                """);

        if (productRepository != null) {
            try {
                List<Product> products = productRepository.findByActiveTrue();
                if (products != null && !products.isEmpty()) {
                    sb.append("\nCurrently featured catalog products in the store:\n");
                    for (int i = 0; i < Math.min(products.size(), 10); i++) {
                        Product p = products.get(i);
                        sb.append(String.format("- %s (Category: %s, Price: ₹%s)\n",
                                p.getName(),
                                p.getCategory() != null ? p.getCategory() : "General",
                                p.getPrice()));
                    }
                }
            } catch (Exception ignored) {
                // Ignore DB read failure during prompt construction
            }
        }

        return sb.toString();
    }

    private String generateFallbackResponse(String userMessage) {
        String lower = userMessage.toLowerCase();

        // Greetings
        if (lower.matches(".*\\b(hi|hello|hey|good morning|good evening|namaste)\\b.*")) {
            return "Hello! 👋 Welcome to NEXCART. I am your shopping assistant! How can I help you today? You can ask me about our products, delivery, order status, or payment options.";
        }

        // Delivery / Shipping
        if (lower.contains("deliver") || lower.contains("shipping") || lower.contains("courier") || lower.contains("reach") || lower.contains("how long")) {
            return "🚚 **Delivery Information**:\n\n"
                    + "• **Free Shipping**: Available on all orders over ₹499.\n"
                    + "• **Standard Delivery**: 3 to 5 business days across India.\n"
                    + "• **Express Delivery**: 1 to 2 business days in major metropolitan areas.\n"
                    + "• Real-time tracking updates are provided under **My Orders** once shipped.";
        }

        // Order tracking / status
        if (lower.contains("track") || (lower.contains("order") && (lower.contains("where") || lower.contains("status") || lower.contains("find")))) {
            return "📦 **Order Tracking**:\n\n"
                    + "You can track your orders by visiting the **My Orders** section from the top navigation bar after logging in.\n"
                    + "You will see live statuses: *Pending*, *Processing*, *Shipped*, and *Delivered*.";
        }

        // Returns / Refunds / Cancellation
        if (lower.contains("return") || lower.contains("refund") || lower.contains("cancel") || lower.contains("exchange")) {
            return "🔄 **Returns & Cancellation Policy**:\n\n"
                    + "• **7-Day Return Window**: Return or exchange eligible items within 7 days of delivery.\n"
                    + "• **Cancellation**: You can cancel pending orders directly in the **My Orders** page before dispatch.\n"
                    + "• **Refunds**: Credited to your original payment method within 5–7 business days.";
        }

        // Payment methods
        if (lower.contains("pay") || lower.contains("payment") || lower.contains("card") || lower.contains("upi") || lower.contains("cod") || lower.contains("razorpay")) {
            return "💳 **Accepted Payment Methods**:\n\n"
                    + "• **Cards**: Visa, MasterCard, RuPay, Maestro\n"
                    + "• **UPI**: Google Pay, PhonePe, Paytm, BHIM\n"
                    + "• **Net Banking**: All major Indian banks\n"
                    + "• **Cash on Delivery (COD)**: Available on select items and postal codes.";
        }

        // Contact / Support / Help
        if (lower.contains("contact") || lower.contains("support") || lower.contains("help") || lower.contains("email") || lower.contains("phone")) {
            return "📞 **Customer Support**:\n\n"
                    + "Our team is here to assist you!\n"
                    + "• **Email**: admin@nexcart.com\n"
                    + "• **Hours**: Mon – Sat, 9:00 AM – 7:00 PM IST\n"
                    + "• Feel free to ask me any product or order-related questions right here!";
        }

        // Product search / recommendations
        if (productRepository != null && (lower.contains("product") || lower.contains("recommend") || lower.contains("show") || lower.contains("buy") || lower.contains("have") || lower.contains("category"))) {
            try {
                List<Product> products = productRepository.findByActiveTrue();
                if (products != null && !products.isEmpty()) {
                    String productList = products.stream()
                            .limit(4)
                            .map(p -> String.format("• **%s** (%s) - ₹%s", p.getName(), p.getCategory(), p.getPrice()))
                            .collect(Collectors.joining("\n"));

                    return "🛍️ **Popular Products at NEXCART**:\n\n"
                            + productList
                            + "\n\nYou can click on any product on the home page for complete details, specs, and to add it to your cart!";
                }
            } catch (Exception ignored) {
            }
        }

        // Default friendly fallback
        return "Thank you for asking! As your NEXCART assistant, I can help you with:\n\n"
                + "• 📦 **Order Tracking & Status**\n"
                + "• 🚚 **Delivery times & shipping costs**\n"
                + "• 🔄 **Returns, refunds, & cancellations**\n"
                + "• 💳 **Payment options & checkout questions**\n"
                + "• 🛍️ **Finding products and deals**\n\n"
                + "What would you like to know?";
    }
}