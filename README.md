# E-Commerce App

## Overview
This is a simple e-commerce application built using **Angular** for the frontend and **Tailwind CSS** for styling. The app provides a user-friendly interface for browsing and purchasing products.

## Features
- Product listing with dynamic data
- Product details page
- Add to cart functionality
- Responsive design with Tailwind CSS
- JSON Server for mock backend API

## Getting Started

### Prerequisites
Make sure you have the following installed:
- **Node.js** (v16 or later recommended)
- **Angular CLI** (install using `npm install -g @angular/cli`)
- **Make** (optional, for convenience in running commands)

### Installation
Install dependencies:
```sh
npm install
```

### Running the App

#### Start JSON Server
Before running the application, you need to start the mock backend using **JSON Server**:
```sh
make s
```
Or, alternatively:
```sh
npm run server
```

#### Start Angular Development Server
Once the JSON server is running, start the Angular application:
```sh
make
```
Or, alternatively:
```sh
npm start
```

The application will be available at: `http://localhost:4200/`

## Scripts
| Command | Description |
|---------|-------------|
| `make s` | Starts the JSON Server |
| `npm run server` | Starts the JSON Server (alternative) |
| `make` | Runs the Angular app |
| `npm start` | Runs the Angular app (alternative) |

## License
This project is licensed under the MIT License.

## Contribution
Feel free to submit issues and pull requests to improve the application!
