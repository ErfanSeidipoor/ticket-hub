docker build -f ./infra/docker/Dockerfile.auth -t erfanseidipoor/tckhb-auth:latest .
docker build -f ./infra/docker/Dockerfile.tickets -t erfanseidipoor/tckhb-tickets:latest .
docker build -f ./infra/docker/Dockerfile.orders -t erfanseidipoor/tckhb-orders:latest .
docker build -f ./infra/docker/Dockerfile.payments -t erfanseidipoor/tckhb-payments:latest .
docker build -f ./infra/docker/Dockerfile.expiration -t erfanseidipoor/tckhb-expiration:latest .
docker build -f ./infra/docker/Dockerfile.client -t erfanseidipoor/tckhb-client:latest .


docker image push erfanseidipoor/tckhb-tickets:latest
docker image push erfanseidipoor/tckhb-orders:latest
docker image push erfanseidipoor/tckhb-payments:latest
docker image push erfanseidipoor/tckhb-auth:latest
docker image push erfanseidipoor/tckhb-expiration:latest
docker image push erfanseidipoor/tckhb-client:latest