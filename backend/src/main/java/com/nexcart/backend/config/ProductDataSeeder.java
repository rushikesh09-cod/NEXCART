package com.nexcart.backend.config;

import com.nexcart.backend.entity.Product;
import com.nexcart.backend.repository.ProductRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Configuration
public class ProductDataSeeder {

    @Bean
    CommandLineRunner seedProducts(
            ProductRepository productRepository
    ) {

        return args -> {

            // Don't insert products if database already contains products
            if (productRepository.count() > 0) {
                System.out.println(
                        "NEXCART: Products already exist. Skipping seed."
                );
                return;
            }

            OffsetDateTime now =
                    OffsetDateTime.now(ZoneOffset.UTC);

            List<Product> products = List.of(

                // =================================================
                // MOBILES
                // =================================================

                create(
                    "Samsung Galaxy A55",
                    "Samsung mid-range smartphone",
                    34999,
                    25,
                    "Mobiles",
                    "Samsung",
                    "/products/samsung-a55.jpg",
                    now
                ),

                create(
                    "iPhone 16",
                    "Apple smartphone with advanced camera",
                    69999,
                    15,
                    "Mobiles",
                    "Apple",
                    "/products/iphone-16.jpg",
                    now
                ),

                create(
                    "OnePlus 13",
                    "OnePlus flagship smartphone",
                    69999,
                    10,
                    "Mobiles",
                    "OnePlus",
                    "/products/oneplus-13.jpg",
                    now
                ),

                create(
                    "Google Pixel 9",
                    "Google Pixel smartphone with AI features",
                    79999,
                    8,
                    "Mobiles",
                    "Google",
                    "/products/pixel-9.jpg",
                    now
                ),

                create(
                    "Nothing Phone 3",
                    "Modern smartphone with unique transparent design",
                    44999,
                    12,
                    "Mobiles",
                    "Nothing",
                    "/products/nothing-phone-3.jpg",
                    now
                ),


                // =================================================
                // ELECTRONICS
                // =================================================

                create(
                    "Dell Inspiron 15",
                    "15-inch laptop for work and study",
                    58999,
                    12,
                    "Electronics",
                    "Dell",
                    "/products/dell-inspiron.jpg",
                    now
                ),

                create(
                    "HP Pavilion 15",
                    "Powerful laptop for everyday productivity",
                    64999,
                    10,
                    "Electronics",
                    "HP",
                    "/products/hp-pavilion.jpg",
                    now
                ),

                create(
                    "Sony WH-1000XM5",
                    "Premium wireless noise cancelling headphones",
                    29999,
                    18,
                    "Electronics",
                    "Sony",
                    "/products/sony-headphones.jpg",
                    now
                ),

                create(
                    "Samsung 55 Inch Smart TV",
                    "4K smart television with streaming apps",
                    54999,
                    7,
                    "Electronics",
                    "Samsung",
                    "/products/samsung-tv.jpg",
                    now
                ),

                create(
                    "Logitech MX Master 3S",
                    "Wireless ergonomic productivity mouse",
                    8999,
                    20,
                    "Electronics",
                    "Logitech",
                    "/products/logitech-mouse.jpg",
                    now
                ),


                // =================================================
                // HOME & KITCHEN
                // =================================================

                create(
                    "Prestige Electric Kettle",
                    "Fast boiling electric kettle for home and office",
                    1499,
                    30,
                    "Home & Kitchen",
                    "Prestige",
                    "/products/prestige-kettle.jpg",
                    now
                ),

                create(
                    "Philips Air Fryer",
                    "Digital air fryer for healthier cooking",
                    7999,
                    14,
                    "Home & Kitchen",
                    "Philips",
                    "/products/philips-airfryer.jpg",
                    now
                ),

                create(
                    "Borosil Glass Set",
                    "Set of premium heat resistant glasses",
                    999,
                    40,
                    "Home & Kitchen",
                    "Borosil",
                    "/products/borosil-glasses.jpg",
                    now
                ),

                create(
                    "Milton Water Bottle",
                    "Stainless steel insulated water bottle",
                    1299,
                    35,
                    "Home & Kitchen",
                    "Milton",
                    "/products/milton-bottle.jpg",
                    now
                ),


                // =================================================
                // FASHION
                // =================================================

                create(
                    "Men's Casual T-Shirt",
                    "Comfortable cotton casual t-shirt",
                    799,
                    50,
                    "Fashion",
                    "Roadster",
                    "/products/mens-tshirt.jpg",
                    now
                ),

                create(
                    "Women's Denim Jacket",
                    "Classic denim jacket for women",
                    1999,
                    25,
                    "Fashion",
                    "Levis",
                    "/products/womens-jacket.jpg",
                    now
                ),

                create(
                    "Men's Running Shoes",
                    "Lightweight running shoes",
                    2499,
                    20,
                    "Fashion",
                    "Nike",
                    "/products/mens-running-shoes.jpg",
                    now
                ),

                create(
                    "Women's Handbag",
                    "Stylish everyday handbag",
                    1799,
                    18,
                    "Fashion",
                    "Lavie",
                    "/products/womens-handbag.jpg",
                    now
                ),


                // =================================================
                // BEAUTY
                // =================================================

                create(
                    "Maybelline Foundation",
                    "Lightweight liquid foundation",
                    699,
                    40,
                    "Beauty",
                    "Maybelline",
                    "/products/maybelline-foundation.jpg",
                    now
                ),

                create(
                    "Lakme Lipstick",
                    "Long lasting matte lipstick",
                    599,
                    45,
                    "Beauty",
                    "Lakme",
                    "/products/lakme-lipstick.jpg",
                    now
                ),

                create(
                    "Nivea Body Lotion",
                    "Moisturizing body lotion for daily use",
                    449,
                    35,
                    "Beauty",
                    "Nivea",
                    "/products/nivea-lotion.jpg",
                    now
                ),


                // =================================================
                // SPORTS
                // =================================================

                create(
                    "Yonex Badminton Racket",
                    "Lightweight badminton racket",
                    2499,
                    20,
                    "Sports",
                    "Yonex",
                    "/products/yonex-racket.jpg",
                    now
                ),

                create(
                    "SG Cricket Bat",
                    "Professional English willow cricket bat",
                    4999,
                    10,
                    "Sports",
                    "SG",
                    "/products/sg-cricket-bat.jpg",
                    now
                ),

                create(
                    "Nike Football",
                    "Durable football for training and matches",
                    1499,
                    25,
                    "Sports",
                    "Nike",
                    "/products/nike-football.jpg",
                    now
                ),


                // =================================================
                // BOOKS
                // =================================================

                create(
                    "Atomic Habits",
                    "Book about building good habits",
                    599,
                    30,
                    "Books",
                    "James Clear",
                    "/products/atomic-habits.jpg",
                    now
                ),

                create(
                    "The Psychology of Money",
                    "Book about money and financial behavior",
                    499,
                    25,
                    "Books",
                    "Morgan Housel",
                    "/products/psychology-money.jpg",
                    now
                ),

                create(
                    "Clean Code",
                    "Programming book about writing maintainable code",
                    799,
                    15,
                    "Books",
                    "Robert C. Martin",
                    "/products/clean-code.jpg",
                    now
                ),


                // =================================================
                // TOYS
                // =================================================

                create(
                    "LEGO Classic Building Set",
                    "Creative building blocks for children",
                    1999,
                    20,
                    "Toys",
                    "LEGO",
                    "/products/lego-classic.jpg",
                    now
                ),

                create(
                    "Remote Control Car",
                    "Rechargeable remote control racing car",
                    1499,
                    18,
                    "Toys",
                    "Funskool",
                    "/products/remote-car.jpg",
                    now
                ),

                create(
                    "Teddy Bear",
                    "Soft plush teddy bear",
                    899,
                    30,
                    "Toys",
                    "Stuffcool",
                    "/products/teddy-bear.jpg",
                    now
                ),


                // =================================================
                // AUTOMOTIVE
                // =================================================

                create(
                    "Car Phone Holder",
                    "Universal dashboard and windshield phone holder",
                    599,
                    35,
                    "Automotive",
                    "Portronics",
                    "/products/car-phone-holder.jpg",
                    now
                ),

                create(
                    "Car Vacuum Cleaner",
                    "Portable vacuum cleaner for car interiors",
                    1999,
                    15,
                    "Automotive",
                    "AGARO",
                    "/products/car-vacuum.jpg",
                    now
                ),

                create(
                    "Car Air Freshener",
                    "Long lasting car fragrance",
                    299,
                    50,
                    "Automotive",
                    "Godrej",
                    "/products/car-freshener.jpg",
                    now
                )

            );


            productRepository.saveAll(products);

            System.out.println(
                    "NEXCART: Seeded "
                    + products.size()
                    + " products successfully."
            );
        };
    }


    // =====================================================
    // PRODUCT CREATOR
    // =====================================================

    private static Product create(
            String name,
            String description,
            double price,
            int stock,
            String category,
            String brand,
            String imageUrl,
            OffsetDateTime now
    ) {

        Product product = new Product();

        product.setName(name);
        product.setDescription(description);
        product.setPrice(BigDecimal.valueOf(price));
        product.setStockQuantity(stock);
        product.setCategory(category);
        product.setBrand(brand);
        product.setImageUrl(imageUrl);
        product.setActive(true);
        product.setCreatedAt(now);
        product.setUpdatedAt(now);

        return product;
    }
}