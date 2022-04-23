FROM bitnami/node:12.22.12-debian-10-r14



WORKDIR /app

COPY ../ /app/

EXPOSE 3000


RUN npm i

CMD ["npm","run","dev"]


