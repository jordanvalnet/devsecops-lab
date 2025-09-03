# devsecops-lab (minimal)
DevSecOps tools in a simple lab
Service Node/Express minimal pour POC DevSecOps

Endpoints:
- GET /health -> { status: "ok", time: ISO }
- POST /search { q: string } -> { query, hash } 
  NOTE: utilise MD5 à dessein pour démo SAST (faible, à corriger ensuite).

Démarrer localement:
- nvm use 18
- npm ci
- npm test
- npm start
# http://localhost:3000/health

Docker:
- docker build -t devsecops-lab:local .
- docker run -p 3000:3000 devsecops-lab:local