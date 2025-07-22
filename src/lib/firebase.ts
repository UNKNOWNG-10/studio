
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  "projectId": "pika-token",
  "appId": "1:974288623322:web:3e15f8a500047287d377e3",
  "storageBucket": "pika-token.firebasestorage.app",
  "apiKey": "AIzaSyDzFES3LnZC7QKgQzsW6APwQ1owaV0MUu4",
  "authDomain": "pika-token.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "974288623322"
};

const app = initializeApp(firebaseConfig);

export { app };
