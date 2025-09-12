AI Paper Evaluator
A web application designed to streamline the process of evaluating academic papers. This tool leverages AI to provide features like plagiarism detection, creative marking, and comprehensive feedback. This repository contains the front-end user interface for authentication and the main dashboard.

✨ Features
User Authentication: Secure sign-up and login functionality.

OTP Email Verification: An extra layer of security for user registration.

Intuitive Dashboard: A clean and modern user interface for a seamless experience.

Drag & Drop File Upload: Easily upload documents (.pdf, .docx, .txt) for evaluation.

Customizable Evaluation: Set parameters like paper type, marking schemes, and add specific instructions.

Responsive Design: Fully functional on both desktop and mobile devices.

🛠️ Tech Stack
This project is currently the front-end implementation.

Frontend: HTML5, CSS3, JavaScript (ES6+), Tailwind CSS

Proposed Backend Stack:
Server: Node.js with Express.js

Database: MongoDB 

AI/ML: Python with libraries like NLTK, Scikit-learn, TensorFlow/PyTorch

Email Service: Nodemailer or SendGrid for sending OTP emails.

🚀 Getting Started
To get a local copy up and running, follow these simple steps.

Prerequisites
You only need a modern web browser to run this front-end project.

Installation
Clone the repo:

git clone [https://github.com/your-username/ai-paper-evaluator.git](https://github.com/your-username/ai-paper-evaluator.git)

Navigate to the project directory:

cd ai-paper-evaluator

Open the HTML files in your browser to view the pages:

Open index.html to see the Login/Sign-up page.

Open home.html to see the main file upload dashboard.

Open otp_email_template.html to preview the OTP email design.

📂 File Structure
.
├── index.html              # Authentication Page (Login, Sign-Up, OTP)
├── home.html               # Main Dashboard/Home Page
├── otp_email_template.html # Static template for the verification email
└── README.md               # This file

Usage
The current implementation provides the user interface flow:

A user visits the application and is presented with the index.html page.

The user can toggle between Login and Sign Up.

Upon signing up, the UI transitions to an OTP verification screen (backend logic required).

After successful login, the user would be redirected to home.html.

On the home page, the user can upload their paper and set evaluation criteria before submitting.

🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
Distributed under the MIT License. See LICENSE for more information.
