Versionamento: era assente (solo 2 commit git, nessun tag). La versione ora vive nel package.json. Il workflow consigliato per rilasciare una nuova versione:


# 1. Aggiorna version in package.json (es. 1.1.0)
# 2. Committa e tagga git
git tag v0.1.0

# 3. Rebuilda l'immagine con il nuovo tag
docker compose build
# oppure manualmente:
docker build -t homepage-proxy:1.1.0 .

# 4. Aggiorna image: nel docker-compose.yml → homepage-proxy:1.1.0
Per il primo avvio ricordati di fare npm install localmente per generare il package-lock.json (che conviene committare per build riproducibili):


npm install