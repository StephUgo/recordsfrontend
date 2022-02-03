# base image
FROM node:14.18.3-slim

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /app/package.json
RUN npm install
RUN npm install -g @angular/cli@13.2.2 --unsafe

# add app
COPY . /app
#COPY patch/browser.js.txt /app/node_modules/@angular-devkit/build-angular/src/webpack/configs/browser.js

RUN ng build


# start app
CMD ng serve --host 0.0.0.0
