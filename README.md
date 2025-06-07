An ongoing personal project for managing and generating member cards for a school organization.

## Technologies used:
Angular
TypeScript
ExpressJS
PostgreSQL
Tailwind CSS

## User interface
Admin Login Page 
![image](https://github.com/user-attachments/assets/f742cb3b-e93f-452c-ad5f-e12313e96b1c)

Admin Dashboard
![image](https://github.com/user-attachments/assets/c9846907-1f3f-4b21-b651-2f8714add49d)

# API Documentation

## GET /api/members

Retrieve a paginated list of members.

### Query Parameters

| Parameter | Type   | Default | Description                      |
| --------- | ------ | ------- | --------------------------------|
| `page`    | number | `1`     | Page number to retrieve          |
| `limit`   | number | `10`    | Number of members per page       |

### Success Response

- **Status:** 200 OK
- **Content:**

```json
{
  "totalMembers": 100,
  "totalPages": 10,
  "currentPage": 1,
  "members": [
    {
      "id": "string",
      "name": "string"
      // other member fields
    }
    // ...
  ],
  "nextPage": 2,          // optional, only present if more pages exist
  "previousPage": null    // optional, only present if not on first page
}

## Sessions API - `/api/sessions`

Manage admin sessions: login and logout.

---

### POST `/api/sessions/login`

Create a new admin session (login).

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "your_password"
}





