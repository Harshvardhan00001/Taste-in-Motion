const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const foodpartnerModel = require('../models/foodpartner.model');
const userModel = require('../models/user.model');
const dishModel = require('../models/dish.model');
const dishAvailabilityModel = require('../models/dishAvailability.model');
const foodModel = require('../models/food.model');

async function seed() {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB.');

        // Clean existing discovery data
        await dishAvailabilityModel.deleteMany({});
        await dishModel.deleteMany({});
        await foodModel.deleteMany({});
        
        console.log('Cleared existing dishes, availabilities, and foods.');

        // 1. Ensure or create Food Partners
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('partner123', salt);

        const partnersData = [
            {
                name: 'The Spice Route',
                email: 'spiceroute@taste.com',
                password: hashedPassword,
                location: { type: 'Point', coordinates: [77.2167, 28.6315] }, // Connaught Place, Delhi
                address: '14 Janpath Road, Connaught Place',
                city: 'New Delhi',
                phone: '+91 98111 22334',
                operatingHours: '12:00 PM - 11:30 PM',
                rating: 4.8,
                cuisines: ['North Indian', 'Mughlai', 'Street Food']
            },
            {
                name: 'Bao & Bowls Co.',
                email: 'baobowls@taste.com',
                password: hashedPassword,
                location: { type: 'Point', coordinates: [77.2001, 28.5494] }, // Hauz Khas, Delhi
                address: '22 Hauz Khas Village',
                city: 'New Delhi',
                phone: '+91 98222 33445',
                operatingHours: '12:30 PM - 11:00 PM',
                rating: 4.6,
                cuisines: ['Pan-Asian', 'Chinese', 'Noodles']
            },
            {
                name: 'Little Italy Trattoria',
                email: 'littleitaly@taste.com',
                password: hashedPassword,
                location: { type: 'Point', coordinates: [77.2319, 28.5744] }, // Defence Colony, Delhi
                address: 'Shop 8, Defence Colony Market',
                city: 'New Delhi',
                phone: '+91 98333 44556',
                operatingHours: '11:00 AM - 11:00 PM',
                rating: 4.7,
                cuisines: ['Italian', 'Pizza', 'Pasta']
            },
            {
                name: 'Dosa & Filter Coffee',
                email: 'dosacafe@taste.com',
                password: hashedPassword,
                location: { type: 'Point', coordinates: [77.2255, 28.5828] }, // Lodhi Colony, Delhi
                address: 'Block 4, Lodhi Colony',
                city: 'New Delhi',
                phone: '+91 98444 55667',
                operatingHours: '8:00 AM - 10:00 PM',
                rating: 4.9,
                cuisines: ['South Indian', 'Street Food', 'Breakfast']
            },
            {
                name: 'Smash Burger Club',
                email: 'smashburger@taste.com',
                password: hashedPassword,
                location: { type: 'Point', coordinates: [77.0895, 28.4986] }, // DLF Cyber Hub, Gurgaon
                address: 'Cyber Hub, Ground Floor',
                city: 'Gurugram',
                phone: '+91 98555 66778',
                operatingHours: '11:00 AM - 1:00 AM',
                rating: 4.5,
                cuisines: ['American', 'Fast Food', 'Burgers']
            }
        ];

        const partners = [];
        for (const p of partnersData) {
            let partner = await foodpartnerModel.findOne({ email: p.email });
            if (!partner) {
                partner = await foodpartnerModel.create(p);
            } else {
                partner = await foodpartnerModel.findByIdAndUpdate(partner._id, p, { new: true });
            }
            partners.push(partner);
        }
        console.log(`Ensured ${partners.length} restaurant partners.`);

        // 2. Create Canonical Dishes
        const dishesData = [
            {
                name: 'Smoked Butter Chicken',
                cuisine: 'North Indian',
                spiceLevel: 'medium',
                mealType: 'dinner',
                priceRange: 'mid-range',
                tags: ['creamy', 'rich', 'comfort', 'curry', 'classic'],
                imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&auto=format&fit=crop&q=80',
                description: 'Tender tandoori chicken simmered in a velvety, buttery tomato gravy infused with fenugreek.',
                isVegetarian: false
            },
            {
                name: 'Crispy Truffle Fries',
                cuisine: 'American',
                spiceLevel: 'mild',
                mealType: 'snack',
                priceRange: 'budget',
                tags: ['crispy', 'snack', 'truffle', 'vegetarian', 'fast bite'],
                imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=800&auto=format&fit=crop&q=80',
                description: 'Hand-cut golden potatoes tossed in white truffle oil, rosemary, and aged parmesan.',
                isVegetarian: true
            },
            {
                name: 'Spicy Dan Dan Noodles',
                cuisine: 'Pan-Asian',
                spiceLevel: 'spicy',
                mealType: 'lunch',
                priceRange: 'mid-range',
                tags: ['spicy', 'noodles', 'sichuan', 'street food', 'comfort'],
                imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop&q=80',
                description: 'Sichuan hand-pulled noodles in a fragrant chili sesame broth topped with crushed peanuts and scallions.',
                isVegetarian: false
            },
            {
                name: 'Woodfired Margherita Pizza',
                cuisine: 'Italian',
                spiceLevel: 'mild',
                mealType: 'dinner',
                priceRange: 'mid-range',
                tags: ['cheesy', 'crispy', 'woodfired', 'classic', 'vegetarian'],
                imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&auto=format&fit=crop&q=80',
                description: 'Slow-fermented sourdough crust, San Marzano tomatoes, fresh buffalo mozzarella, and sweet basil.',
                isVegetarian: true
            },
            {
                name: 'Crispy Ghee Roast Dosa',
                cuisine: 'South Indian',
                spiceLevel: 'medium',
                mealType: 'breakfast',
                priceRange: 'budget',
                tags: ['crispy', 'ghee', 'breakfast', 'comfort', 'vegetarian'],
                imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800&auto=format&fit=crop&q=80',
                description: 'Golden fermented rice crepe roasted in pure desi ghee, served with coconut chutney and piping hot sambar.',
                isVegetarian: true
            },
            {
                name: 'Double Patty Smash Burger',
                cuisine: 'American',
                spiceLevel: 'medium',
                mealType: 'lunch',
                priceRange: 'mid-range',
                tags: ['juicy', 'cheesy', 'burger', 'comfort', 'crispy'],
                imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80',
                description: 'Lacy seared beef-style patties, double American cheddar, house secret relish on toasted brioche.',
                isVegetarian: false
            },
            {
                name: 'Paneer Tikka Roll',
                cuisine: 'North Indian',
                spiceLevel: 'spicy',
                mealType: 'snack',
                priceRange: 'budget',
                tags: ['spicy', 'roll', 'street food', 'vegetarian', 'quick bite'],
                imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&auto=format&fit=crop&q=80',
                description: 'Smoky spiced cottage cheese chunks rolled in flaky paratha with mint yogurt and pickled onions.',
                isVegetarian: true
            },
            {
                name: 'Steamed Crystal Dim Sum',
                cuisine: 'Pan-Asian',
                spiceLevel: 'mild',
                mealType: 'lunch',
                priceRange: 'mid-range',
                tags: ['steamed', 'healthy', 'dumpling', 'pan-asian'],
                imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&auto=format&fit=crop&q=80',
                description: 'Translucent tapioca wraps filled with wild mushrooms, edamame, and water chestnuts with chili dip.',
                isVegetarian: true
            },
            {
                name: 'Hyderabadi Dum Biryani',
                cuisine: 'North Indian',
                spiceLevel: 'spicy',
                mealType: 'dinner',
                priceRange: 'mid-range',
                tags: ['spicy', 'biryani', 'rich', 'comfort', 'classic'],
                imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop&q=80',
                description: 'Long-grain basmati layered with spiced saffron marinade, slow-cooked in a sealed handi.',
                isVegetarian: false
            },
            {
                name: 'Creamy Fettuccine Alfredo',
                cuisine: 'Italian',
                spiceLevel: 'mild',
                mealType: 'dinner',
                priceRange: 'mid-range',
                tags: ['creamy', 'cheesy', 'pasta', 'comfort', 'vegetarian'],
                imageUrl: 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=800&auto=format&fit=crop&q=80',
                description: 'Fresh artisanal fettuccine ribboned through rich parmesan cream and garlic butter.',
                isVegetarian: true
            }
        ];

        const createdDishes = await dishModel.insertMany(dishesData);
        console.log(`Created ${createdDishes.length} canonical dishes.`);

        // 3. Create Dish Availability (Multi-restaurant pricing for comparisons!)
        const availabilities = [
            // Smoked Butter Chicken available at Spice Route (Specialty) and Little Italy's sister kitchen
            {
                dish: createdDishes[0]._id,
                restaurant: partners[0]._id, // Spice Route
                price: 280,
                isAvailable: true,
                prepTimeMinutes: 20,
                isSpecialty: true
            },
            {
                dish: createdDishes[0]._id,
                restaurant: partners[3]._id, // Dosa Cafe's dinner counter
                price: 240,
                isAvailable: true,
                prepTimeMinutes: 25,
                isSpecialty: false
            },
            // Truffle Fries at Smash Burger Club & Little Italy
            {
                dish: createdDishes[1]._id,
                restaurant: partners[4]._id, // Smash Burger
                price: 180,
                isAvailable: true,
                prepTimeMinutes: 12,
                isSpecialty: false
            },
            {
                dish: createdDishes[1]._id,
                restaurant: partners[2]._id, // Little Italy
                price: 220,
                isAvailable: true,
                prepTimeMinutes: 15,
                isSpecialty: true
            },
            // Spicy Dan Dan Noodles at Bao & Bowls
            {
                dish: createdDishes[2]._id,
                restaurant: partners[1]._id, // Bao & Bowls
                price: 290,
                isAvailable: true,
                prepTimeMinutes: 18,
                isSpecialty: true
            },
            // Woodfired Margherita Pizza at Little Italy & Smash Burger
            {
                dish: createdDishes[3]._id,
                restaurant: partners[2]._id, // Little Italy
                price: 340,
                isAvailable: true,
                prepTimeMinutes: 20,
                isSpecialty: true
            },
            {
                dish: createdDishes[3]._id,
                restaurant: partners[4]._id, // Smash Burger
                price: 299,
                isAvailable: true,
                prepTimeMinutes: 25,
                isSpecialty: false
            },
            // Ghee Roast Dosa at Dosa Cafe
            {
                dish: createdDishes[4]._id,
                restaurant: partners[3]._id, // Dosa Cafe
                price: 140,
                isAvailable: true,
                prepTimeMinutes: 10,
                isSpecialty: true
            },
            // Double Patty Smash Burger at Smash Burger Club
            {
                dish: createdDishes[5]._id,
                restaurant: partners[4]._id, // Smash Burger
                price: 260,
                isAvailable: true,
                prepTimeMinutes: 15,
                isSpecialty: true
            },
            // Paneer Tikka Roll at Spice Route and Dosa Cafe
            {
                dish: createdDishes[6]._id,
                restaurant: partners[0]._id, // Spice Route
                price: 160,
                isAvailable: true,
                prepTimeMinutes: 12,
                isSpecialty: true
            },
            {
                dish: createdDishes[6]._id,
                restaurant: partners[3]._id, // Dosa Cafe
                price: 130,
                isAvailable: true,
                prepTimeMinutes: 15,
                isSpecialty: false
            },
            // Steamed Crystal Dim Sum at Bao & Bowls
            {
                dish: createdDishes[7]._id,
                restaurant: partners[1]._id, // Bao & Bowls
                price: 240,
                isAvailable: true,
                prepTimeMinutes: 15,
                isSpecialty: true
            },
            // Hyderabadi Dum Biryani at Spice Route
            {
                dish: createdDishes[8]._id,
                restaurant: partners[0]._id, // Spice Route
                price: 320,
                isAvailable: true,
                prepTimeMinutes: 25,
                isSpecialty: true
            },
            // Creamy Fettuccine Alfredo at Little Italy
            {
                dish: createdDishes[9]._id,
                restaurant: partners[2]._id, // Little Italy
                price: 360,
                isAvailable: true,
                prepTimeMinutes: 22,
                isSpecialty: true
            }
        ];

        await dishAvailabilityModel.insertMany(availabilities);
        console.log(`Created ${availabilities.length} dish-to-restaurant availability records.`);

        // 4. Video files map
        // Local static paths served via http://localhost:3000/videos/...
        const localVideos = [
            'http://localhost:3000/videos/1583289-hd_712_1366_20fps.mp4',
            'http://localhost:3000/videos/3198245-hd_720_1280_50fps.mp4',
            'http://localhost:3000/videos/3298011-hd_1080_2048_25fps.mp4',
            'http://localhost:3000/videos/4058071-hd_1080_2048_25fps.mp4',
            'http://localhost:3000/videos/5900834-hd_1080_2048_25fps.mp4',
            'http://localhost:3000/videos/6202680-hd_1080_1920_25fps.mp4'
        ];

        const reelsData = [
            {
                name: createdDishes[0].name, // Butter Chicken
                description: 'Slow-smoked butter chicken hot from the tandoor at The Spice Route!',
                video: localVideos[0],
                dish: createdDishes[0]._id,
                foodPartner: partners[0]._id,
                likeCount: 142,
                savesCount: 89,
                viewsCount: 1250,
                completionsCount: 920,
                durationSeconds: 16
            },
            {
                name: createdDishes[2].name, // Dan Dan Noodles
                description: 'Tossing spicy Dan Dan noodles with our signature Sichuan chili oil!',
                video: localVideos[1],
                dish: createdDishes[2]._id,
                foodPartner: partners[1]._id,
                likeCount: 230,
                savesCount: 145,
                viewsCount: 2100,
                completionsCount: 1780,
                durationSeconds: 14
            },
            {
                name: createdDishes[3].name, // Margherita Pizza
                description: 'Woodfired sourdough crust blistering at 450°C. Pure artisanal magic!',
                video: localVideos[2],
                dish: createdDishes[3]._id,
                foodPartner: partners[2]._id,
                likeCount: 380,
                savesCount: 210,
                viewsCount: 3400,
                completionsCount: 2900,
                durationSeconds: 15
            },
            {
                name: createdDishes[4].name, // Ghee Roast Dosa
                description: 'Crispiest ghee roast dosa in town with coconut chutney and piping hot sambar.',
                video: localVideos[3],
                dish: createdDishes[4]._id,
                foodPartner: partners[3]._id,
                likeCount: 195,
                savesCount: 120,
                viewsCount: 1800,
                completionsCount: 1450,
                durationSeconds: 18
            },
            {
                name: createdDishes[5].name, // Smash Burger
                description: 'Double beef patties smashed to crispy perfection with bubbling cheddar cheese.',
                video: localVideos[4],
                dish: createdDishes[5]._id,
                foodPartner: partners[4]._id,
                likeCount: 510,
                savesCount: 340,
                viewsCount: 4500,
                completionsCount: 3800,
                durationSeconds: 15
            },
            {
                name: createdDishes[6].name, // Paneer Tikka Roll
                description: 'Crispy charcoal-smoked paneer wrapped in flaky laccha paratha with spicy green chutney.',
                video: localVideos[5],
                dish: createdDishes[6]._id,
                foodPartner: partners[0]._id,
                likeCount: 164,
                savesCount: 98,
                viewsCount: 1600,
                completionsCount: 1280,
                durationSeconds: 12
            }
        ];

        await foodModel.insertMany(reelsData);
        console.log(`Created ${reelsData.length} food reels with video media and stats.`);

        console.log('✅ Seed completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err);
        process.exit(1);
    }
}

seed();
