FROM alpine

RUN apk upgrade --update && apk add --no-cache nodejs npm python3 python3-dev gcc gfortran freetype-dev musl-dev libpng-dev g++ lapack-dev
RUN python3 -m ensurepip

WORKDIR /app
COPY . .

RUN python3 -m pip install -r server/requirements.txt
RUN npm install && npm run build
RUN npm install -g serve
RUN serve --help

ARG log_mnt=/tmp/gomoku

EXPOSE 8080 5000
VOLUME [ "${log_mnt}" ]

ENV GOMOKU_LOG_DIR=${log_mnt}
CMD [ "/bin/sh", "./start.sh"]