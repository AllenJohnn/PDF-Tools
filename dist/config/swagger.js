"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
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
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=swagger.js.map