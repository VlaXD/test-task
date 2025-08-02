// for local env
//
// local shell:
// > chmod 400 ./Docker/cluster/mongo_keyfile
//
// or
//
// cd infra/Docker/cluster
// openssl rand -base64 756 > mongo_keyfile
// chmod 400 mongo_keyfile
//
// compose up
//
// inside container
// > mongosh -u root -p example --eval "rs.initiate({ _id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})"
