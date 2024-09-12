.PHONY : all clean fclean stop

DOCKER_COMPOSE_FILE = ./docker-compose.yml

all : 
	docker-compose -f $(DOCKER_COMPOSE_FILE) up -d --build

stop :
	docker-compose -f $(DOCKER_COMPOSE_FILE) stop

clean :
	docker-compose -f $(DOCKER_COMPOSE_FILE) down -v 2> /dev/null || true;

fclean : clean prune
	docker stop $(shell docker ps -qa); docker rm $(shell docker ps -qa); docker rmi -f $(shell docker images -qa); docker rm $(shell docker volume ls -q); docker network rm $(shell docker network ls -q) 2> /dev/null || true;

prune :
	docker system prune -a -f --volumes

re : fclean all
