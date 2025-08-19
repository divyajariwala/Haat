import { MarketDetail, Category, SubCategory, Item } from '../types';

export const mockMarketData: MarketDetail = {
  id: 4532,
  name: "Haat Food Market",
  categories: [
    {
      id: 1,
      name: "Fast Food",
      image: "https://im-staging.haat.delivery/fast-food.jpg",
      subCategories: [
        {
          id: 101,
          name: "Burgers",
          categoryId: 1,
          items: [
            {
              id: 1001,
              name: "Classic Beef Burger",
              description: "Juicy beef patty with fresh vegetables",
              price: 8.99,
              image: "https://im-staging.haat.delivery/burger1.jpg",
              subCategoryId: 101,
            },
            {
              id: 1002,
              name: "Chicken Burger",
              description: "Grilled chicken with special sauce",
              price: 7.99,
              image: "https://im-staging.haat.delivery/burger2.jpg",
              subCategoryId: 101,
            },
          ],
        },
        {
          id: 102,
          name: "Pizza",
          categoryId: 1,
          items: [
            {
              id: 1003,
              name: "Margherita Pizza",
              description: "Classic tomato and mozzarella",
              price: 12.99,
              image: "https://im-staging.haat.delivery/pizza1.jpg",
              subCategoryId: 102,
            },
            {
              id: 1004,
              name: "Pepperoni Pizza",
              description: "Spicy pepperoni with cheese",
              price: 14.99,
              image: "https://im-staging.haat.delivery/pizza2.jpg",
              subCategoryId: 102,
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Asian Cuisine",
      image: "https://im-staging.haat.delivery/asian.jpg",
      subCategories: [
        {
          id: 201,
          name: "Chinese",
          categoryId: 2,
          items: [
            {
              id: 2001,
              name: "Kung Pao Chicken",
              description: "Spicy chicken with peanuts",
              price: 11.99,
              image: "https://im-staging.haat.delivery/chinese1.jpg",
              subCategoryId: 201,
            },
            {
              id: 2002,
              name: "Sweet and Sour Pork",
              description: "Crispy pork with tangy sauce",
              price: 10.99,
              image: "https://im-staging.haat.delivery/chinese2.jpg",
              subCategoryId: 201,
            },
          ],
        },
        {
          id: 202,
          name: "Japanese",
          categoryId: 2,
          items: [
            {
              id: 2003,
              name: "Sushi Roll Set",
              description: "Fresh salmon and avocado rolls",
              price: 16.99,
              image: "https://im-staging.haat.delivery/sushi1.jpg",
              subCategoryId: 202,
            },
            {
              id: 2004,
              name: "Ramen Bowl",
              description: "Rich broth with noodles and pork",
              price: 13.99,
              image: "https://im-staging.haat.delivery/ramen1.jpg",
              subCategoryId: 202,
            },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Desserts",
      image: "https://im-staging.haat.delivery/desserts.jpg",
      subCategories: [
        {
          id: 301,
          name: "Ice Cream",
          categoryId: 3,
          items: [
            {
              id: 3001,
              name: "Vanilla Ice Cream",
              description: "Creamy vanilla with chocolate chips",
              price: 4.99,
              image: "https://im-staging.haat.delivery/icecream1.jpg",
              subCategoryId: 301,
            },
            {
              id: 3002,
              name: "Strawberry Ice Cream",
              description: "Fresh strawberry flavor",
              price: 5.99,
              image: "https://im-staging.haat.delivery/icecream2.jpg",
              subCategoryId: 301,
            },
          ],
        },
        {
          id: 302,
          name: "Cakes",
          categoryId: 3,
          items: [
            {
              id: 3003,
              name: "Chocolate Cake",
              description: "Rich chocolate with ganache",
              price: 8.99,
              image: "https://im-staging.haat.delivery/cake1.jpg",
              subCategoryId: 302,
            },
            {
              id: 3004,
              name: "Cheesecake",
              description: "Creamy New York style",
              price: 7.99,
              image: "https://im-staging.haat.delivery/cake2.jpg",
              subCategoryId: 302,
            },
          ],
        },
      ],
    },
  ],
}; 