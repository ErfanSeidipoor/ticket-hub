minikube start --driver=docker
minikube service <service-name> --url

minikube service tckhb-tickets-clisterip-service --url
sudo minikube tunnel
minikube dashboard

minikube addons enable ingress
kubectl get ingress
kubectl get pods -n ingress-nginx

kubectl get ingress

minikube service index-nodeport-service --url
curl --resolve "tckhb.com:80:$( minikube ip )" -i http://tckhb.com/api/auth

https://kubernetes.io/docs/tasks/access-application-cluster/ingress-minikube/
https://minikube.sigs.k8s.io/docs/start/

kubectl get services -n ingress-nginx
kubectl get ingress
minikube ip (getting ip in linux)

thiisunsafe

kubectl rollout restart deployment <>

// imperetive command in k8s > run command to directly create object
// declarative approach > write config file and apply
kubectl create secret generic jwt-secret --from-literal=JWT_KEY=jwt-key-value
kubectl create secret generic jwt-secret-test --from-literal=JWT_KEY=jwt-key-value

skaffold -f ./skaffold.dev.yaml dev
skaffold -f ./skaffold.test.yaml dev
skaffold -f ./skaffold.test.yaml test
skaffold -f ./skaffold.test.yaml run
skaffold -f ./skaffold.test.tickets.yaml dev

kubectl get services --namespace=ingress-nginx

//cross namespace communication
http://<name of service (ex: ingress-nginx-controller)>/<name of name space (ex: ingress-nginx)>.src.cluster.local

kubectl describe nodes

docker system prune -a

kubectl apply -f ./in

kubectl port-forward tckhb-tickets-deployment-76c9c4fb5d-bz4s8 8003:8003

skaffold -f ./skaffold.dev.tickets.yaml dev
kubectl apply -f ./infra/k8s.dev/tickets-mongo.deployment.yaml
kubectl apply -f ./infra/k8s.dev/tickets.deployment.yaml
kubectl apply -f ./infra/k8s.dev/kafka.deployment.yaml
