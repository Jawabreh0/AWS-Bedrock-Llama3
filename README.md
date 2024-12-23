# AWS Bedrock Llama 3

This repository contains a simple chat application to show how to configure AWS Bedrock Llama 3 models in your own app. The application allows users to interact with the Llama 3 model via the command line.

## Features

- Command-line interface for chatting with Llama 3.
- Integration with AWS Bedrock for natural language processing.

## Installation

To install and run the project locally, follow these steps:

1. Clone the repository:
    ```sh
    git clone https://github.com/Jawabreh0/AWS-Bedrock-Llama3.git
    cd AWS-Bedrock-Llama3
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory and add your AWS credentials:
    ```env
    AWS_ACCESS_KEY_ID=your_access_key_id
    AWS_SECRET_ACCESS_KEY=your_secret_access_key
    AWS_REGION=your_aws_region
    ```

## Usage

To start the chat application, run the following command:
```sh
node src/index.js
