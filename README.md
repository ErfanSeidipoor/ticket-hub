minikube start --driver=docker
minikube start --driver=docker --force
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

kubectl port-forward tckhb-kafdrop-deployment-664c597659-22nqz 9000:9000

skaffold -f ./skaffold.dev.tickets.yaml dev
kubectl apply -f ./infra/k8s.dev/tickets-mongo.deployment.yaml
kubectl apply -f ./infra/k8s.dev/tickets.deployment.yaml
kubectl apply -f ./infra/k8s.dev/kafka.deployment.yaml
kubectl apply -f ./infra/k8s.dev/kafdrop.deployment.yaml

kubectl delete deployments --all -n default
kubectl delete services --all -n default

## Develop tickets

kubectl apply -f ./infra/k8s.dev/tickets-mongo.deployment.yaml
kubectl apply -f ./infra/k8s.dev/kafka.deployment.yaml
kubectl apply -f ./infra/k8s.dev/kafdrop.deployment.yaml
kubectl apply -f ./infra/k8s.dev/auth.deployment.yaml
kubectl apply -f ./infra/k8s.dev/auth-mongo.deployment.yaml
kubectl apply -f ./infra/k8s.dev/kafdrop.deployment.yaml

skaffold -f ./skaffold.dev.tickets.yaml dev

kubectl port-forward tckhb-tickets-deployment-5f4c698667-xhr8h 8003:8003
kubectl port-forward tckhb-kafdrop-deployment-5dd9fd89dd-gstv2 9000:9000

minikube service <service>
minikube service <service> --url
curl $(minikube service tckhb-kafdrop-nodeport-service --url)

kubectl expose deployment tckhb-kafdrop-deployment --type=NodePort

kubectl get pods
kubectl get deployments
kubectl get services

/etc/nginx/nginx.conf
sudo nginx -t
sudo service nginx restart

kubectl delete pods --all
kubectl delete deployments --all
kubectl delete services --all

nx test tickets --skip-nx-cach --runInBand
nx test tickets --skip-nx-cache --test-file="apps/tickets/src/test/consumers/order-created.consumer.spec.ts"
nx test tickets --skip-nx-cache --test-file="apps/tickets/src/test/api/create-ticket.tickets.spec.ts"

nx test orders --skip-nx-cache --test-file=""
nx test auth --skip-nx-cache --test-file=""
kubectl get pods -w

kubectl -n <namespace> get secret <name-of-secret> -o jsonpath="{.data.password}" | base64 -d
