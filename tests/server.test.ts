import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest"; // supertest allows you to test without actually starting the server
import app, { resetGameStore } from "../server";

// Clear live game store before every test so GET /games tests see isolated state
beforeEach(() => {
  resetGameStore();
});

describe("Server API", () => {
  it("GET /api/games returns 200", async () => {
    const response = await request(app)
      .get("/api/games")
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe("POST /create", () => {
  it("should create a new game with correct initial state", async () => {
    const response = await request(app)
      .post("/create")
      .expect(200);

    // - an id (exists and is a string)
    expect(response.body).toHaveProperty("id") // ensuring that the property ID exists
    expect(typeof response.body.id).toBe("string") // checking that it is a string
    expect(response.body.id.length).toBeGreaterThan(0) // checking that the ID is not null
    // - a board (array of 9 nulls)
    expect(response.body).toHaveProperty("board") // checks for property board
    expect(Array.isArray(response.body.board)).toBe(true) // checks for array
    expect(response.body.board).toHaveLength(9) // checks for board to be 9 cells (0-8)
    expect(response.body.board.every(cell => cell === null)).toBe(true) // 
    // - currentPlayer equals "X"
    expect(response.body).toHaveProperty("currentPlayer")
    expect(response.body.currentPlayer).toBe("X")
  });

  it("should create games with unique IDs", async () => {
        // make two POST requests to /create
    const response1 = await request(app) 
    .post("/create")
    .expect(200)

    const response2 = await request(app)
    .post("/create")
    .expect(200)

    // compare the ids from each response
    // they should not be equal
    expect(response1.body.id).not.toBe(response2.body.id)
  });
});


describe("GET /games", () => {
  beforeEach(() => {
    resetGameStore();
  });

  it("should return an empty array when there are no games", async() => {
    const response = await request(app)
    .get("/games")
    .expect(200)

    //no games - GET returns an empty array
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body).toHaveLength(0) // checks for empty array
});

  it("should return all games that have been created by post", async() => {
    const response1 = await request(app)
      .post("/create")
      .expect(200)
    const id1 = response1.body.id;

    const response2 = await request(app)
      .post("/create")
      .expect(200)
    const id2 = response2.body.id;

    const response3 = await request(app)
      .get("/games")
      .expect(200)

    expect(Array.isArray(response3.body)).toBe(true)
    const ids = response3.body.map((g: { id: string }) => g.id);
    expect(ids).toContain(id1);
    expect(ids).toContain(id2)
  })
})

describe("GET /game/:id", () => {
  it("returns the game when id exists", async () => {
    const createRes = await request(app)
    .post("/create")
    .expect(200)

    const id = createRes.body.id;

    const getRes = await request(app)
    .get(`/game/${id}`)
    .expect(200)

    expect(getRes.body).toHaveProperty("id", id);
    expect(getRes.body).toHaveProperty("board");
    expect(getRes.body).toHaveProperty("currentPlayer", "X");
    expect(getRes.body.board).toHaveLength(9);
  })

  it("returns 404 when id does not exist", async () => {
    await request(app)
    .get("/game/nonexistent")
    .expect(404)
  })
})

describe("POST /move/:id", () => {
  it("applies a valid move: board updates and currentPlayer switches", async () => {
    const createRes = await request(app)
    .post("/create")
    .expect(200)
    const id = createRes.body.id;

    const moveRes = await request(app)
    .post(`/move/${id}`)
    .send({ position: 0 })
    .expect(200);

    expect(moveRes.body.id).toBe(id);
    expect(moveRes.body.board[0]).toBe("X");
    expect(moveRes.body.currentPlayer).toBe("O")

  })

  it("returns error when moving to an occupied cell", async () => {
    const createRes = await request(app).post("/create").expect(200);
    const id = createRes.body.id;
  
    await request(app).post(`/move/${id}`).send({ position: 0 }).expect(200);
  
    const invalidRes = await request(app)
      .post(`/move/${id}`)
      .send({ position: 0 });
  
    expect(invalidRes.status).toBe(400);
    expect(invalidRes.body?.error ?? invalidRes.text).toMatch(/occupied|invalid/i);
  });

  it("returns 404 when game id does not exist", async () => {
    await request(app)
      .post("/move/nonexistent")
      .send({ position: 0 })
      .expect(404);
  });

})
