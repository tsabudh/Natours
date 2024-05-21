# Natours - Tour Booking Application

Welcome to Natours, a comprehensive tour booking application built using Node.js and integrated with the Stripe gateway for secure payments. This project features user authentication, tour reviews, and a dynamic booking system, all powered by MongoDB. The application is server-side rendered, providing a seamless and efficient user experience.

## Live Demo

Explore the live demo of Natours at [https://natours-tsabudh.netlify.app/.netlify/functions/api](https://natours-tsabudh.netlify.app/.netlify/functions/api).

## Features

### Authentication
- **User Registration and Login**: Secure user registration and login using JWT (JSON Web Tokens).
- **Password Management**: Password reset functionality via email.

### Tour Booking
- **Tour Listings**: Browse and view detailed information about available tours.
- **Booking System**: Book tours securely with Stripe integration.
- **Payment Processing**: Handle payments using Stripe's payment gateway.

### Reviews
- **User Reviews**: Users can leave reviews and ratings for tours they have attended.
- **Review Management**: Admin can manage and moderate user reviews.

### Database
- **MongoDB Integration**: Utilize MongoDB for robust and scalable data management.

### Server-Side Rendering
- **Efficient Rendering**: The application is server-side rendered for better performance and SEO.

## Technologies Used

- **Node.js**: The runtime environment for executing JavaScript on the server.
- **Express.js**: A web application framework for Node.js.
- **MongoDB**: A NoSQL database for storing application data.
- **Stripe API**: For handling secure payment transactions.
- **JWT (JSON Web Tokens)**: For secure user authentication.
- **Pug (formerly Jade)**: Templating engine for server-side rendering.

## Getting Started

To get a local copy of the project up and running, follow these simple steps.

### Prerequisites

Ensure you have the following installed on your local machine:
- Node.js
- MongoDB

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/natours.git
    ```
2. Navigate to the project directory:
    ```
    cd natours
    ```
3. Install the necessary dependencies
    ```
    npm install
    ```
4. Configure
    Create .env file and add following variables
    ```
    NODE_ENV=development
    PORT=3000
    DATABASE=mongodb://localhost:27017/natours
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRES_IN=90d
    JWT_COOKIE_EXPIRES_IN=90
    EMAIL_USERNAME=your_email_username
    EMAIL_PASSWORD=your_email_password
    EMAIL_HOST=smtp.your-email-provider.com
    EMAIL_PORT=587
    STRIPE_SECRET_KEY=your_stripe_secret_key
    ```

5. Run your application

    ```sh
    npm run dev

    ```
6. Open your browser and go to 

    ```
    http://localhost:3000
    ```
