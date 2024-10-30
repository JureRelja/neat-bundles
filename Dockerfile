FROM node:22-alpine

EXPOSE 3000


WORKDIR /app
COPY . .

ENV NODE_ENV=production

RUN npm install --ignore-engines --omit=dev 
# Remove CLI packages since we don't need them in production by default.
# Remove this line if you want to run CLI commands in your container.
RUN npm remove @shopify/app @shopify/cli
RUN npm run build --ignore-engines

# You'll probably want to remove this in production, it's here to make it easier to test things!
#RUN rm -f prisma/dev.sqlite

CMD ["npm", "run", "docker-start"]
