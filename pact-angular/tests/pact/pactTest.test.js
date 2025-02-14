import { Pact } from '@pact-foundation/pact';
import { ApiService } from '../src/app/services/api.service';
import path from 'path';

// Configurar el Mock Server de Pact
const provider = new Pact({
  consumer: 'AngularApp',
  provider: 'UserService',
  port: 8080,
  log: path.resolve(__dirname, 'logs', 'pact.log'),
  dir: path.resolve(__dirname, 'pacts'),
  logLevel: 'info',
});

describe('Pact con UserService', () => {
  beforeAll(() => provider.setup());
  afterAll(() => provider.finalize());

  test('Debe obtener un usuario por ID', async () => {
    await provider.addInteraction({
      state: 'Un usuario con ID 1 existe',
      uponReceiving: 'Una solicitud para obtener el usuario con ID 1',
      withRequest: {
        method: 'GET',
        path: '/users/1',
        headers: {
          Accept: 'application/json',
        },
      },
      willRespondWith: {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          id: 1,
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
      },
    });

    // Instanciar el servicio Angular y hacer la solicitud
    const apiService = new ApiService();
    const user = await apiService.getUser(1);

    expect(user).toEqual({
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
    });

    await provider.verify();
  });
});
