import { NextResponse } from "next/server";
import { swaggerConfig } from "@/lib/swagger";

export async function GET() {
  const spec = swaggerConfig.definition;


  const origin = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
  spec.servers = [
    {
      url: origin,
      description: "Current server",
    },
    {
      url: "http://localhost:3000",
      description: "Development server",
    },
  ];

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HobbyHop - API Documentation</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css" />
  <style>
    html, body {
      margin: 0;
      padding: 0;
    }
    .topbar {
      display: none;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      window.ui = SwaggerUIBundle({
        spec: ${JSON.stringify(spec, null, 2)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout",
        requestInterceptor: (request) => {
          request.headers['Content-Type'] = 'application/json';
          return request;
        },
        responseInterceptor: (response) => {
          return response;
        },
        displayRequestDuration: true,
        tryItOutEnabled: true,
        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch']
      });
    };
  </script>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html",
    },
  });
}
