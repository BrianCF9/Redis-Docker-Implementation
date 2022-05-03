const grpc = require("@grpc/grpc-js");
const PROTO_PATH = "./searchInventory.proto"
var protoLoader = require("@grpc/proto-loader");
const { client } = require("./src/dbconnector");

const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
const a = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

server.addService(a.InventorySearch.service,{
  GetServerResponse: (call,callback)=>{
    const busqueda = call.request.message;
    console.log(busqueda)
    client.connect((err, client, release) => {
      if (err) {
        return console.error('Error acquiring client', err.stack)
      }
      client.query(`select * from items where name like '%' || $1 || '%';`,[busqueda], (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
        }
        console.log(result.rows)
        callback(null,{product:result.rows});
      })
    })
  },
});

server.bindAsync(
    "0.0.0.0:50051",
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
      console.log("Server running at http://127.0.0.1:50051");
      server.start();
    }
  );