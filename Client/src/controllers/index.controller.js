const grpc = require("@grpc/grpc-js");
const PROTO_PATH = "./src/controllers/searchInventory.proto"

var protoLoader = require("@grpc/proto-loader");

const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);

const InventorySearch= grpc.loadPackageDefinition(packageDefinition).InventorySearch;

const client = new InventorySearch(
    "grpc_server:50051",
    grpc.credentials.createInsecure()
  );

const searchitems=async (req,res)=>{
    const busqueda=req.params.name
    client.GetServerResponse({message:busqueda}, (error,items) =>{
        if(error){
            console.log("error aaaa")
            res.status(400).json(error);
        }
        else{
            res.status(200).json(items);

        }
        
    });
}





module.exports={
 searchitems
}