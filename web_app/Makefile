
.PHONY : all clean fclean stop

DOCKER_COMPOSE_FILE = ./docker-compose.yml

all : 
	docker-compose -f $(DOCKER_COMPOSE_FILE) up -d --build

# build_images:
# 	POSTGRES_PORT=5433 NESTJS_PORT=3002 NESTJS_DEBUG_PORT=5556 NEXTJS_PORT=3003 NGINX_PORT=8081 \
# 	INSTANCE_NAME="instance1" \
# 	docker-compose -f $(DOCKER_COMPOSE_FILE) build

instance1:
	POSTGRES_PORT=5433 NESTJS_PORT=3002 NESTJS_DEBUG_PORT=5556 NEXTJS_PORT=3003 NGINX_PORT=8081 \
	INSTANCE_NAME="instance1" \
	docker-compose -f $(DOCKER_COMPOSE_FILE) -p instance1 up --build -d

instance2:
	POSTGRES_PORT=5434 NESTJS_PORT=3004 NESTJS_DEBUG_PORT=5557 NEXTJS_PORT=3005 NGINX_PORT=8082 \
	INSTANCE_NAME="instance2" \
	docker-compose -p instance2 up --build -d

stop :
	docker-compose -f $(DOCKER_COMPOSE_FILE) stop

clean :
	docker-compose -f $(DOCKER_COMPOSE_FILE) down -v 2> /dev/null || true;

fclean : clean prune
	docker stop $(shell docker ps -qa); docker rm $(shell docker ps -qa); docker rmi -f $(shell docker images -qa); docker rm $(shell docker volume ls -q); docker network rm $(shell docker network ls -q) 2> /dev/null || true;

prune :
	docker system prune -a -f --volumes

# https://stackoverflow.com/questions/30604846/docker-error-no-space-left-on-device/56147993#56147993

re : fclean all

# to solve not permissioned issue with docker : sudo aa-remove-unknown
