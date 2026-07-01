# PrepaVol

[![Build and Deploy](https://github.com/ytrsk0/prepavol-ac-camargue/actions/workflows/ci.yml/badge.svg)](https://github.com/yannick-teresiak/prepavol/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

Prepavol is a modern web application that helps prepare light aviation flights.
It provides a _weight and balance_ form that allows you to pick a plane from a fleet and plan the load (passengers, baggage, fuel).
It also uses meteorological data for a given airfield to predict the takeoff or landing distances for the planned weight, powered by a highly accurate multivariate linear regression model matching original POH specifications.
The application produces a complete report that can be added to the flight documents.

This is the modernized React/Vite TypeScript version of the original Prepavol Flask app.

## Installation

Clone the repository and install the dependencies. This project uses Node.js and npm.

```bash
git clone https://github.com/yannick-teresiak/prepavol.git
cd prepavol
npm install
```

## Usage

To run the application locally in development mode (which starts the Vite dev server and the Express backend):

```bash
npm run dev
```

Then open your browser and navigate to `http://localhost:3000`.

### Production Build

To build the application for production, run:

```bash
npm run build
```

This will bundle the React frontend using Vite and compile the Express server into `dist/server.cjs`.

To start the production server locally:

```bash
npm run start
```
Then access it at `http://localhost:3000`.

## Run tests locally

You can run the TypeScript type checking and linter with the following command:

```bash
npm run lint
```

There are also several standalone test scripts (e.g., `test_ml.ts`, `test_grid.ts`, `testMath.ts`) used to validate the regression models and interpolation math against the original POH data. You can run them using `npx tsx`:

```bash
npx tsx test_ml.ts
```

## Deployment

The application is container-ready and built to be easily deployed on services like Google Cloud Run. A standard Dockerfile is included, and GitHub Actions (`ci.yml`) can be configured to automatically build and deploy the container.

### Building the Docker image

```bash
docker build -t prepavol-react .
docker run -p 3000:3000 -d prepavol-react
```
Then browse to `http://localhost:3000`.

