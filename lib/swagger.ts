/**
 * HobbyHop API Documentation
 * This file defines the Swagger/OpenAPI specification for the API
 */

export const swaggerConfig = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HobbyHop API",
      version: "1.0.0",
      description: "API for managing hobby sessions, meetups, and participants",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
      },
      {
        url: "https://your-domain.com",
        description: "Production server",
      },
    ],
    tags: [
      { name: "Authentication", description: "User authentication endpoints" },
      { name: "Hobbies", description: "Hobby meetups — MongoDB `hobbies` collection" },
      { name: "Participants", description: "Join requests — MongoDB `participants` (hobbyId)" },
      { name: "Geocoding", description: "Address geocoding and location services" },
      { name: "Development", description: "Development and testing endpoints" },
    ],
    paths: {
      "/api/seed": {
        post: {
          tags: ["Development"],
          summary: "Seed database with random sessions",
          description: "Generate random hobby groups for testing (Toronto/Mississauga area)",
          parameters: [
            {
              name: "count",
              in: "query",
              description: "Number of sessions to generate (default: 10)",
              required: false,
              schema: { type: "integer", default: 10 },
            },
          ],
          responses: {
            "200": {
              description: "Sessions created successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      sessions: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            title: { type: "string" },
                            category: { type: "string" },
                            location: {
                              type: "object",
                              properties: {
                                address: { type: "string" },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            "500": {
              description: "Internal server error",
            },
          },
        },
      },
      "/api/auth/signup": {
        post: {
          tags: ["Authentication"],
          summary: "Register a new user",
          description: "Create a new user account",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "name", "password"],
                  properties: {
                    email: {
                      type: "string",
                      format: "email",
                      example: "user@example.com",
                    },
                    name: {
                      type: "string",
                      example: "John Doe",
                    },
                    password: {
                      type: "string",
                      minLength: 6,
                      example: "password123",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "User created successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      user: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          email: { type: "string" },
                          name: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad request - missing or invalid fields",
            },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Authentication"],
          summary: "Login user",
          description: "Authenticate user and create session",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: {
                      type: "string",
                      format: "email",
                      example: "user@example.com",
                    },
                    password: {
                      type: "string",
                      example: "password123",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      user: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          email: { type: "string" },
                          name: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Unauthorized - invalid credentials",
            },
          },
        },
      },
      "/api/auth/me": {
        get: {
          tags: ["Authentication"],
          summary: "Get current user",
          description: "Retrieve authenticated user information",
          responses: {
            "200": {
              description: "Current user information",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      user: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          email: { type: "string" },
                          name: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/auth/logout": {
        post: {
          tags: ["Authentication"],
          summary: "Logout user",
          description: "Clear user session",
          responses: {
            "200": {
              description: "Logout successful",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      success: { type: "boolean" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/hobbies": {
        get: {
          tags: ["Hobbies"],
          summary: "Get upcoming groups",
          description: "Retrieve upcoming hobby groups (optional hostId filter)",
          responses: {
            "200": {
              description: "List of upcoming groups",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        hostId: { type: "string" },
                        title: { type: "string" },
                        category: { type: "string" },
                        tags: {
                          type: "array",
                          items: { type: "string" },
                        },
                        date: { type: "string", format: "date" },
                        startTime: { type: "string" },
                        endTime: { type: "string" },
                        capacity: { type: "number" },
                        location: {
                          type: "object",
                          properties: {
                            address: { type: "string" },
                            latitude: { type: "number" },
                            longitude: { type: "number" },
                          },
                        },
                        description: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
            "500": {
              description: "Internal server error",
            },
          },
        },
        post: {
          tags: ["Hobbies"],
          summary: "Create a hobby group",
          description: "Create a meetup (title or legacy subject; category drives factory defaults)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: [
                    "hostId",
                    "date",
                    "startTime",
                    "endTime",
                    "capacity",
                    "address",
                  ],
                  properties: {
                    hostId: {
                      type: "string",
                      description: "User ID of the host",
                    },
                    title: {
                      type: "string",
                      example: "Weekend hiking crew",
                    },
                    subject: {
                      type: "string",
                      description: "Legacy alias for title",
                    },
                    category: {
                      type: "string",
                      enum: ["general", "sports", "music", "education"],
                    },
                    tags: {
                      type: "array",
                      items: { type: "string" },
                      example: ["outdoor", "beginners-welcome"],
                    },
                    date: {
                      type: "string",
                      format: "date",
                      example: "2024-12-15",
                    },
                    startTime: {
                      type: "string",
                      example: "14:00",
                    },
                    endTime: {
                      type: "string",
                      example: "16:00",
                    },
                    capacity: {
                      type: "number",
                      example: 10,
                    },
                    address: {
                      type: "string",
                      example: "Community centre, Main St",
                    },
                    description: {
                      type: "string",
                      example: "Casual hike — all levels welcome",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Group created successfully",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      hostId: { type: "string" },
                      title: { type: "string" },
                      category: { type: "string" },
                      tags: { type: "array", items: { type: "string" } },
                      date: { type: "string" },
                      startTime: { type: "string" },
                      endTime: { type: "string" },
                      capacity: { type: "number" },
                      location: { type: "object" },
                      description: { type: "string" },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad request - missing required fields",
            },
            "500": {
              description: "Internal server error",
            },
          },
        },
      },
      "/api/hobbies/search": {
        post: {
          tags: ["Hobbies"],
          summary: "Search groups",
          description:
            "POST filters + rankingType; uses MongoDB via GroupRepository and SearchMediator",
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    filters: {
                      type: "object",
                      properties: {
                        subject: { type: "string", description: "Title filter" },
                        category: { type: "string" },
                        tags: {
                          type: "array",
                          items: { type: "string" },
                        },
                        date: { type: "string", format: "date" },
                        maxDistance: { type: "number" },
                        userLocation: {
                          type: "object",
                          properties: {
                            latitude: { type: "number" },
                            longitude: { type: "number" },
                          },
                        },
                      },
                    },
                    rankingType: {
                      type: "string",
                      enum: ["relevance", "distance", "time"],
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Ranked group search results",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        title: { type: "string" },
                        category: { type: "string" },
                        tags: { type: "array", items: { type: "string" } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/hobbies/{id}": {
        get: {
          tags: ["Hobbies"],
          summary: "Get group details",
          description: "Get one hobby group by id",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "Group ID",
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Group details",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      hostId: { type: "string" },
                      title: { type: "string" },
                      category: { type: "string" },
                      tags: { type: "array", items: { type: "string" } },
                      date: { type: "string" },
                      startTime: { type: "string" },
                      endTime: { type: "string" },
                      capacity: { type: "number" },
                      location: { type: "object" },
                      description: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
        delete: {
          tags: ["Hobbies"],
          summary: "Delete a group",
          description: "Host-only — deletes group and related join rows",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "Group ID",
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Group deleted successfully",
            },
            "404": {
              description: "Group not found",
            },
          },
        },
      },
      "/api/participants": {
        post: {
          tags: ["Participants"],
          summary: "Request to join a hobby meetup",
          description:
            "Create join request with contact details for the host (MongoDB participants collection, field `hobbyId`)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["hobbyId", "userId", "contactEmail", "contactPhone"],
                  properties: {
                    hobbyId: {
                      type: "string",
                      description: "Hobby meetup ID to join",
                    },
                    groupId: {
                      type: "string",
                      description: "Legacy alias for hobbyId",
                    },
                    sessionId: {
                      type: "string",
                      description: "Legacy alias for hobbyId",
                    },
                    userId: {
                      type: "string",
                      description: "User ID requesting to join",
                    },
                    contactEmail: { type: "string", format: "email" },
                    contactPhone: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Join request created",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      hobbyId: { type: "string" },
                      groupId: { type: "string" },
                      sessionId: { type: "string" },
                      userId: { type: "string" },
                      contactEmail: { type: "string" },
                      contactPhone: { type: "string" },
                      status: {
                        type: "string",
                        enum: ["pending", "approved", "rejected"],
                      },
                      requestedAt: { type: "string", format: "date-time" },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad request - missing fields or already requested",
            },
            "500": {
              description: "Internal server error",
            },
          },
        },
      },
      "/api/participants/{id}": {
        get: {
          tags: ["Participants"],
          summary: "Get participant details",
          description: "Get detailed information about a participant",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "Participant ID",
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "Participant details",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      id: { type: "string" },
                      hobbyId: { type: "string" },
                      groupId: { type: "string" },
                      sessionId: { type: "string" },
                      userId: { type: "string" },
                      contactEmail: { type: "string" },
                      contactPhone: { type: "string" },
                      status: { type: "string" },
                      requestedAt: { type: "string" },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Participant not found",
            },
          },
        },
        patch: {
          tags: ["Participants"],
          summary: "Update participant status",
          description:
            "Update participant status (e.g., accept/reject join request)",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "Participant ID",
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["pending", "approved", "rejected"],
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Participant updated",
            },
            "404": {
              description: "Participant not found",
            },
          },
        },
      },
      "/api/hobbies/{id}/participants": {
        get: {
          tags: ["Hobbies"],
          summary: "Get group participants",
          description: "All join rows for a group",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "Group ID",
              schema: { type: "string" },
            },
          ],
          responses: {
            "200": {
              description: "List of participants",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        userId: { type: "string" },
                        status: { type: "string" },
                        requestedAt: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      "/api/geocode": {
        get: {
          tags: ["Geocoding"],
          summary: "Geocode an address",
          description: "Convert an address to geographic coordinates using Google Maps Geocoding API",
          parameters: [
            {
              name: "address",
              in: "query",
              required: true,
              description: "Address to geocode",
              schema: { type: "string" },
              example: "Campus Library, Room 201",
            },
          ],
          responses: {
            "200": {
              description: "Geocoding result",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      found: {
                        type: "boolean",
                        description: "Whether the address was found",
                      },
                      lat: {
                        type: "number",
                        description: "Latitude coordinate",
                        example: 40.7128,
                      },
                      lng: {
                        type: "number",
                        description: "Longitude coordinate",
                        example: -74.0060,
                      },
                      formattedAddress: {
                        type: "string",
                        description: "Formatted address from Google Maps",
                        example: "Campus Library, Room 201, University Campus, City, State 12345",
                      },
                      placeId: {
                        type: "string",
                        description: "Google Places ID",
                        example: "ChIJN1t_tDeuEmsRUsoyG83frY4",
                      },
                      status: {
                        type: "string",
                        description: "Status when address not found",
                        example: "ZERO_RESULTS",
                      },
                    },
                  },
                  examples: {
                    success: {
                      value: {
                        found: true,
                        lat: 40.7128,
                        lng: -74.0060,
                        formattedAddress: "Campus Library, Room 201, University Campus, City, State 12345",
                        placeId: "ChIJN1t_tDeuEmsRUsoyG83frY4",
                      },
                    },
                    notFound: {
                      value: {
                        found: false,
                        status: "ZERO_RESULTS",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Bad request - missing address parameter",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                        example: "missing address",
                      },
                    },
                  },
                },
              },
            },
            "500": {
              description: "Internal server error - missing API key",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      error: {
                        type: "string",
                        example: "missing api key",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "userId",
        },
      },
    },
  },
};
