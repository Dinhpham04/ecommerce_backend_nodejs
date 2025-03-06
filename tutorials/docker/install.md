# 1. install redis 
c1: docker run --name rdb -p 6379:6379 redis
c2: docker run --name rdb -d -p 6379:6379 redis

# 2. run redis-cli 
docker exec -it rdb redis-cli 

# 3. install mongodb 

## 4. Start
docker start rdb (start redis)
docker start mdb (start mongodb)