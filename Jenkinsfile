pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('client') {
                    bat 'npm install'
                }
            }
        }

        stage('Run Tests') {
            steps {
                dir('client') {
                    bat 'npm test -- --run'
                }
            }
        }

        stage('Lint') {
            steps {
                dir('client') {
                    bat 'npm run lint'
                }
            }
        }

        stage('Build') {
            steps {
                dir('client') {
                    bat 'npm run build'
                }
            }
        }
    }

    post {
        success {
            echo '✅ All tests, linting, and build completed successfully!'
        }

        failure {
            echo '❌ Pipeline failed. Check the console output.'
        }
    }
}