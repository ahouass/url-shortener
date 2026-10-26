URL Shortener
A simple URL shortener built with Python, FastAPI, SQLAlchemy, and SQLite. It converts long URLs into short links, redirects visitors to the original URLs, and tracks clicks.
Features
Shorten a valid HTTP or HTTPS URL
Redirect short links to their original URLs
View saved URLs and their click counts
Delete a shortened URL
Store data locally in SQLite
Requirements
Python 3.10 or newer (Python 3.11+ recommended)
`pip`
Node.js and npm only if you are also running a separate frontend
1. Download the project
Clone the repository (replace the example URL with your own):
```bash
git clone <YOUR_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>
```
2. Open the backend folder
```bash
cd backend
```
The backend should contain files such as:
```text
backend/
├── main.py
├── database.py
├── models.py
└── schemas.py
```
3. Create and activate a virtual environment
Windows (PowerShell):
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```
macOS / Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```
If PowerShell blocks activation, you can run `venv\Scripts\python.exe` directly instead of activating the environment.
4. Install Python dependencies
If the project includes a `requirements.txt` file:
```bash
pip install -r requirements.txt
```
Otherwise, install the packages used by the current backend:
```bash
pip install fastapi "uvicorn[standard]" sqlalchemy
```
FastAPI installs Pydantic as a dependency.
5. Start the backend
Run this command from the backend folder:
```bash
uvicorn main:app --reload
```
If the `uvicorn` command isn't recognized, use:
```bash
python -m uvicorn main:app --reload
```
The backend will normally be available at:
API: http://127.0.0.1:8000
Interactive API documentation: http://127.0.0.1:8000/docs
On startup, SQLAlchemy creates the `urls` table if it doesn't exist. The SQLite database is stored in `urls.db` in the current working directory. The `create_all()` call does not migrate existing tables after schema changes.
6. Test the API
You can test all endpoints from http://127.0.0.1:8000/docs using the Try it out button.
Create a short URL
`POST /shorten`
Request body:
```json
{
  "url": "https://example.com/some/long/path"
}
```
Example response (values are illustrative):
```json
{
  "id": 1,
  "short_code": "1",
  "original_url": "https://example.com/some/long/path",
  "clicks": 0,
  "created_at": "2026-10-26T10:00:00"
}
```
Open `http://127.0.0.1:8000/1` in your browser to follow the short link. Replace `1` with the `short_code` from your response.
List shortened URLs
`GET /urls`
Returns all saved URL records, newest first.
Delete a short URL
`DELETE /urls/{code}`
For example, `DELETE /urls/1` removes the record with short code `1` and returns HTTP 204 on success.
Redirect and count a click
`GET /{code}`
Looks up the short code, increments its click count, and redirects to the original URL (HTTP 307).
7. Run the frontend (if your repository includes one)
Open a second terminal and navigate to the frontend directory, if present:
```bash
cd frontend
npm install
npm run dev
```
Open the local URL printed by the development server (often `http://localhost:5173` for Vite).
Keep the backend running in the first terminal. Your current FastAPI CORS configuration allows frontend origins on localhost / 127.0.0.1 using ports 5173–5175. If your frontend uses another port, update `allow_origins` in `main.py`.
Project files
File	Purpose
`main.py`	FastAPI routes, Base62 encoding, redirects, and CORS
`database.py`	SQLite connection, SQLAlchemy engine, and session dependency
`models.py`	SQLAlchemy `URL` database model
`schemas.py`	Pydantic request and response validation
`urls.db`	SQLite database file (created when the database is used)
Troubleshooting
`ModuleNotFoundError`: Activate your virtual environment and install the dependencies.
`uvicorn` not found: Run `python -m uvicorn main:app --reload`.
Port 8000 already in use: Stop the other process or run `uvicorn main:app --reload --port 8001`.
Frontend CORS error: Check that the frontend's exact origin is listed in `allow_origins`.
Database file in the wrong folder: Run Uvicorn from `backend/`; `sqlite:///./urls.db` is relative to the current working directory.
Development notes
The current Base62 short codes are derived from sequential database IDs. They are predictable, not secret or random.
The temporary `__pending__` short code used during creation can cause a unique-constraint error under concurrent requests. Replace this approach before production use.
`--reload` is intended for local development, not production deployment.