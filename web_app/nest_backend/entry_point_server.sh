#!/bin/sh

# if [ ! -d "/usr/src/app/prisma/migrations" ]
# then
# 	npx prisma migrate dev --name init \
# 	&& npx prisma generate \
# 	&& npm run start:dev
# else
# 	npx prisma generate \
# 	&& npm run start:dev
# fi

# sleep 10;

npx prisma generate && npx prisma migrate deploy && npm run start:dev
