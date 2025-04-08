import { MinimalApiApplication } from "../src/core/app";
import { Router } from "../src/routing/router";
import { JsonResult, NoContentResult } from "../src/core/types";
import { cors, errorHandler, requestLogger } from "../src/core/middleware";

// Create a new Minimal API application
const app = new MinimalApiApplication();

// Configure services
app.configureServices(services => {
  // Register services here
  // Example: services.addSingleton(UserService);
});

// Configure the application
app.configure(builder => {
  // Add global middleware
  builder.useMiddleware(errorHandler());
  builder.useMiddleware(requestLogger());
  builder.useMiddleware(cors(["http://localhost:3000"]));

  // Create a router
  const router = new Router();

  // Define routes
  router.get("/", async () => {
    return "Hello, World!";
  });

  // API routes
  router.group("/api", api => {
    // Users routes
    api.group("/users", users => {
      // Get all users
      users.get("/", async () => {
        return [
          { id: 1, name: "John Doe" },
          { id: 2, name: "Jane Smith" },
        ];
      });

      // Get user by ID
      users.get("/:id", async context => {
        const userId = parseInt(context.request.params.id);
        
        if (userId === 1) {
          return { id: 1, name: "John Doe" };
        } else if (userId === 2) {
          return { id: 2, name: "Jane Smith" };
        } else {
          return new JsonResult({ error: "User not found" }, 404);
        }
      });

      // Create a new user
      users.post("/", async context => {
        const userData = context.request.body;
        
        // Validate user data
        if (!userData.name) {
          return new JsonResult({ error: "Name is required" }, 400);
        }
        
        // In a real app, you would save the user to a database
        return new JsonResult({ id: 3, name: userData.name }, 201);
      });

      // Update a user
      users.put("/:id", async context => {
        const userId = parseInt(context.request.params.id);
        const userData = context.request.body;
        
        // Validate user data
        if (!userData.name) {
          return new JsonResult({ error: "Name is required" }, 400);
        }
        
        // In a real app, you would update the user in a database
        return { id: userId, name: userData.name };
      });

      // Delete a user
      users.delete("/:id", async context => {
        const userId = parseInt(context.request.params.id);
        
        // In a real app, you would delete the user from a database
        return new NoContentResult();
      });
    });
  });

  // Apply the router to the application builder
  router.applyTo(builder);
});

// Run the application
app.run(3000).then(() => {
  console.log("Server is running on http://localhost:3000");
}).catch(error => {
  console.error("Failed to start server:", error);
});