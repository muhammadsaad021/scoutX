import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "app/api", // define api folder under app folder
    definition: {
      openapi: "3.0.0",
      info: {
        title: "ScoutX API Documentation",
        version: "1.0",
        description: "API for ScoutX Player Evaluation Platform",
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [],
    },
  });
  return spec;
};
