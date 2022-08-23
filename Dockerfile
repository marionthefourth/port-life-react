# pull the official base image
FROM node:lts-alpine3.15

# set working direction
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install application dependencies
COPY package.json package-lock.json yarn.lock craco.config.js ./
RUN yarn

# add app
COPY . ./
CMD ["yarn", "start"]