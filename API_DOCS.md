# Marketing Application API Documentation

## Authentication
*   **POST /api/auth/register**: Register a new user. (Public)
*   **POST /api/auth/login**: Login and receive JWT. (Public)
*   **POST /api/auth/forgot-password**: Request password reset link. (Public)
*   **POST /api/auth/reset-password/:token**: Reset password. (Public)

## Campaigns
*   **GET /api/campaigns**: Get all campaigns. (Private)
*   **POST /api/campaigns**: Create a new campaign. (Private)
*   **PUT /api/campaigns/:id**: Update a campaign. (Private)
*   **DELETE /api/campaigns/:id**: Delete a campaign. (Private)

## Leads & CRM
*   **GET /api/leads**: Get all leads. (Private)
*   **POST /api/leads**: Create a lead. (Private)
*   **PUT /api/leads/:id**: Update a lead. (Private)
*   **DELETE /api/leads/:id**: Delete a lead. (Private)
*   **GET /api/deals**: Get all pipeline deals. (Private)
*   **POST /api/deals**: Create a deal. (Private)
*   **PUT /api/deals/:id**: Update a deal stage/value. (Private)

## Task Management
*   **GET /api/tasks**: Get all tasks for calendar. (Private)
*   **POST /api/tasks**: Create a task. (Private)

## Analytics
*   **GET /api/analytics/dashboard**: Fetch aggregated metrics (ROI, Spend, Revenue, Leads). (Private)

## File Management
*   **POST /api/files/upload**: Upload a file/image (multipart/form-data). (Private)

## User Management (RBAC)
*   **GET /api/users**: Get all users. (Super Admin)
*   **PUT /api/users/:id/role**: Change user role. (Super Admin)
