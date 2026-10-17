// import { login } from "../../src/controllers/authControllers";
// import { describe, it, expect } from "vitest";
// import request from "supertest";
// import app from "../../src/app";

// describe("Post /authControllers", () => {
//   it("Random login checkpoint", async () => {
//     const response = await request(app).post("/auth/login").send({
//       email: "owner123@gmail.com",
//       password: "owner1234567",
//     });

//     // expect(response.body.user).toBe({
//     //   user: {
//     //     email: "owner123@gmail.com",
//     //     role: "Owner"
//     //   }
//     // });
//     expect(response.status).toBe(401);
//   });

//   it("Owner login checkpoint", async () => {
//     const response = await request(app).post("/auth/login").send({
//       email: "bryanchen0923@gmail.com",
//       password: "Bryan123",
//     });

//     expect(response.status).toBe(200);
//   })

//   // it("Check login cookie settings", async () => {
//   //   const reponse = await 
//   // })

// });
