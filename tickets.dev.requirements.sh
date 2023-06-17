echo "dev:tickets"

# kubectl delete deployments --all -n default

# kubectl apply -f ./infra/k8s.dev/tickets-mongo.deployment.yaml
# kubectl apply -f ./infra/k8s.dev/kafka.deployment.yaml
# kubectl apply -f ./infra/k8s.dev/kafdrop.deployment.yaml


kubectl port-forward tckhb-kafdrop-deployment-5dd9fd89dd-bm8nj 9000:9000 & \
kubectl port-forward tckhb-kafka-deployment-76885d488b-vx66n 9092:9092