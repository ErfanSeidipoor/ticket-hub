minikube start --driver=docker
minikube service <service-name> --url
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

skaffold -f ./skaffold.dev.yaml dev
skaffold -f ./skaffold.test.yaml dev
skaffold -f ./skaffold.test.yaml test
skaffold -f ./skaffold.test.yaml run
