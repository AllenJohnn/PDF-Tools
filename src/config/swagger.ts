import swaggerJsdoc from "swagger-jsdoc";

const options: any = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "PDF Processor API",
      version: "1.0.0",
      description: "Process, merge, split, and convert PDFs with ease",
      contact: {
        name: "PDF Studio",
        url: "https://github.com/AllenJohnn/PDF-Tools",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        HealthResponse: {
          type: "object",
          properties: {
            status: { type: "string" },
            message: { type: "string" },
            timestamp: { type: "string" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string" },
            statusCode: { type: "number" },
            timestamp: { type: "string" },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
