const { Pact } = require("@pact-foundation/pact");
const path = require("path");
const axios = require("axios");



describe("Pact Test", () => {
  const provider = new Pact({
    consumer: "ReactApp",
    provider: "ProductService",
    port: 4000,
    dir: path.resolve(process.cwd(), "pacts"),
  });

  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());

  test("Debe obtener los datos del usuario correctamente", async () => {
    // Definir el contrato esperado
    await provider.addInteraction({
      state: "El usuario existe en la base de datos",
      uponReceiving: "Una petición GET a /users/1",
      withRequest: {
        method: "GET",
        path: "/users/1",
      },
      willRespondWith: {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: {
          id: 1,
          name: "Juan Pérez",
          email: "juan@example.com",
        },
      },
    });

    // Llamada real desde el frontend
    const response = await axios.get("http://localhost:4000/users/1");

    // Validación de la respuesta
    expect(response.status).toBe(200);
    expect(response.data).toEqual({
      id: 1,
      name: "Juan Pérez",
      email: "juan@example.com",
    });

    await provider.verify(); // Verifica que la respuesta coincida con el contrato
  });

});
