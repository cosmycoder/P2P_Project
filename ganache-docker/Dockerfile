FROM fedora:40
RUN dnf install -y npm nodejs
RUN npm install ganache --global
EXPOSE 7545
ENTRYPOINT ganache-cli -p 7545 -h 0.0.0.0 -i 1337 --accounts 10 -e 10000 --seed 69420 -l 500000000
