# escape`

FROM kkarczmarczyk/node-yarn:latest

ADD . .
RUN yarn

EXPOSE 3000
