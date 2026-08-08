# User & Administrator Manual

## Getting Started
Upon first launch, run `node backend/seedAdmin.js` to create the initial Super Admin account (`admin@example.com` / `password123`).

## Dashboard
The dashboard provides a real-time overview of:
- **Total Leads & Qualified Leads**
- **Marketing Spend vs. Revenue Generated** (yielding overall ROI)
- **Active Campaigns**
Use the **Export Report** button to download a CSV snapshot of these metrics.

## CRM & Pipeline
Navigate to **Sales Pipeline** (`/pipeline`) to view all Deals. Drag and drop deals across stages (Prospecting -> Won/Lost). Moving a deal to "Closed Won" automatically adds its value to the Dashboard's Revenue metric.

## Marketing Builders
- **Email Builder**: Use the rich text editor to draft and format campaigns.
- **Landing Page Builder**: Use the component blocks to design responsive layouts.
- **Form Builder**: Construct custom lead capture forms by adding various input fields.

## File Management
Navigate to the **Media Library** (`/media`) to upload images, PDFs, and other assets required for your campaigns.

## Team Settings (Super Admin Only)
Super Admins can access `/settings` to invite new team members and assign Roles (Admin, Marketing Manager, Sales Executive, Viewer) to restrict access.

## Automations
Navigate to `/workflow` to build trigger-based logic chains (e.g., "When Lead Created -> Wait 2 Days -> Send Email").
