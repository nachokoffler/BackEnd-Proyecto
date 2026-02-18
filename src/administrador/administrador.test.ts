import request from "supertest";

const url_base = "http://localhost:8080"

describe("crud de administrador", () => {

    let token: string
    let normal_token: string

    beforeAll(async () => {
        const res = await request(url_base).post("/administradores/logIn").send({ cod_administrador: 9 , contrasenia: "123r"})
        token = res.body.token

        const normal_res = await request(url_base).post("/administradores/logIn").send({ cod_administrador: 8, contrasenia: "123r"})
        normal_token = res.body.token
    });

    it("should reject request without token", async () => {
      const res = await request(url_base).get("/administradores");
      expect(res.status).toBe(401); // Unauthorized
    });
    
    it("should return a list of admins", async () => {
        const response = await request(url_base).get("/administradores").set("Authorization", `Bearer ${token}`)
        expect(response.status).toBe(201)
        expect(Array.isArray(response.body.data)).toBe(true)
        expect(response.body.data[0]).toHaveProperty("nombre")
        expect(response.body.data.length).toBeGreaterThan(0)
    })

    it("should return only one admin", async () => {
        const response = await request(url_base).get("/administradores/1").set("Authorization", `Bearer ${token}`)
        expect(response.status).toBe(201)
        expect(!(Array.isArray(response.body.data))).toBe(true)
        expect(response.body.data).toHaveProperty("nombre")
    })

    it("should create an admin", async () => {
        const new_admin = {
            nombre: "Juan",
            apellido: "Perez",
            dni: 3434356, //change this field once the test runs
            fecha_ini_contrato: "2024-09-09",
            fecha_fin_contrato: null,
            contrasenia: "123r",
            es_especial: true
        }

        const response = await request(url_base).post("/administradores").send(new_admin).set("Authorization", `Bearer ${token}`)
        expect(response.status).toBe(201)
        expect(response.body.data).toHaveProperty("cod_administrador")
    })

    it("should not create an admin, due to it already being inside the system.", async () => {
        const new_admin = {
            nombre: "Juan",
            apellido: "Perez",
            dni: 343434,
            fecha_ini_contrato: "2024-09-09",
            fecha_fin_contrato: null,
            contrasenia: "123r",
            es_especial: true
        }

        const response = await request(url_base).post("/administradores").send(new_admin).set("Authorization", `Bearer ${token}`)
        expect(response.status).toBe(409)
    })
})
