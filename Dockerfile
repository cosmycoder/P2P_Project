FROM fedora:40
# FROM debian:stable
RUN dnf -y install nodejs npm
# RUN apt-get -y update && apt-get -y install nodejs npm
RUN npm install truffle --global
RUN npm install web3 --global
RUN npm install serve --global
RUN npm install lite-server --global
RUN npm install tailwindcss --global
EXPOSE 3000
EXPOSE 80
WORKDIR /app
ENTRYPOINT [ "./start_client.sh" ]

