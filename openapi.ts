import swaggerJsDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Deno Micro CMS",
      version: "1.0.0",
    },
    servers: [
      { url: "/api" },
    ],
  },
  apis: ["./api/*.ts"],
};

const openapiSpecification = swaggerJsDoc(options);

await Deno.writeTextFile(
  "./openapi.json",
  JSON.stringify(openapiSpecification),
);
