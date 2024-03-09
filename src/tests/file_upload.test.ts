import request from "supertest";
import { Express } from "express";
import initApp from "../app";
import fs from "fs/promises";

let app: Express;

beforeAll(async () => {
  app = await initApp();

  // Check if the file already exists
  const fileExists = await fs.access('public/magicwand.png')
    .then(() => true)
    .catch(() => false);

  // If the file doesn't exist, upload it
  if (!fileExists) {
    await request(app)
      .post('/api/file/image')
      .attach('file', 'public/magicwand.png');
  }
});

describe('Image Upload API', () => {
  test('responds with 200 and image URL if image is provided', async () => {
    const response = await request(app)
      .post('/api/file/image') 
      .attach('file', 'public/magicwand.png'); 

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('url');
  });

  test('responds with 400 if no image is provided', async () => {
    const response = await request(app)
      .post('/api/file/image') 

    expect(response.status).toBe(400);
    expect(response.text).toBe('No image file provided.');
  });
});
