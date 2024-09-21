<p align="center">
  <a href="https://github.com/mamalli11/InstaBackend" rel="noopener">
    <img width=200px height=200px src="https://cdn-icons-png.flaticon.com/512/8983/8983087.png" alt="Project logo"></a>
</p>

<h3 align="center">InstaBackend</h3>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![GitHub Issues](https://img.shields.io/github/issues/mamalli11/InstaBackend.svg)](https://github.com/mamalli11/InstaBackend/issues)
[![GitHub Pull Requests](https://img.shields.io/github/issues-pr/mamalli11/InstaBackend.svg)](https://github.com/mamalli11/InstaBackend/pulls)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

---

<p align="center">A feature-rich backend for an Instagram-like social media platform built with NestJS and PostgreSQL.
    <br> 
</p>

## 📝 Table of Contents

-  [About](#about)
-  [Getting Started](#getting_started)
-  [Deployment](#deployment)
-  [Usage](#usage)
-  [Built Using](#built_using)
-  [Authors](#authors)
-  [Acknowledgments](#acknowledgement)

## 🧐 About <a name = "about"></a>

InstaBackend is a scalable backend API for a social media platform modeled after Instagram. It
includes essential features such as user registration, post management, and interaction
functionalities like comments, likes, and following. Built with NestJS, PostgreSQL, and Swagger for
API documentation, this project aims to mimic the core functionalities of Instagram while allowing
further extensibility.

The main focus of this project is to offer a fully functional backend where users can register,
follow each other, create and manage posts and stories, like content, and much more. Future updates
will bring additional features to enhance the social experience.

## 🏁 Getting Started <a name = "getting_started"></a>

These instructions will help you set up a local development environment and get the backend up and
running for testing and development purposes.

### Prerequisites

You'll need the following software installed:

-  Node.js (version 14 or later)
-  PostgreSQL
-  NestJS
-  Git

### Installing

Clone the repository:

```bash
git clone https://github.com/mamalli11/InstaBackend.git
```

Navigate into the project directory:

```bash
cd InstaBackend
```

Install dependencies:

```bash
npm install
```

Set up your PostgreSQL database and update the environment variables in the `.env` file with your
database credentials.

Run the application:

```bash
npm run start:dev
```

## 🎈 Usage <a name="usage"></a>

Once the backend is running, Swagger documentation is available at `/api/docs`, which provides
detailed descriptions of all available API endpoints, such as user registration, post creation, and
interaction features.

## 🚀 Deployment <a name = "deployment"></a>

For deployment to a live system, configure your production environment and run:

```bash
npm run build
npm run start:prod
```

You can deploy using Docker as well. Make sure to set up your PostgreSQL instance and update the
`.env` variables accordingly.

## ⛏️ Built Using <a name = "built_using"></a>

-  [NestJS](https://nestjs.com/) - Server Framework
-  [PostgreSQL](https://www.postgresql.org/) - Database
-  [Swagger](https://swagger.io/) - API Documentation
-  [Node.js](https://nodejs.org/) - Server Environment

## ✍️ Authors <a name = "authors"></a>

-  [@mamalli11](https://github.com/mamalli11) - Initial work

## 🎉 Acknowledgements <a name = "acknowledgement"></a>

-  Thanks to the NestJS community for the resources and support
-  Inspired by the core functionalities of Instagram
