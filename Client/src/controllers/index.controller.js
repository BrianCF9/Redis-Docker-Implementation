const grpc = require("@grpc/grpc-js");
const PROTO_PATH = "./src/controllers/searchInventory.proto"
var redis = require('redis')
var protoLoader = require("@grpc/proto-loader");

const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};

const redis_client = redis.createClient({
    url:"redis://redis"
});

redis_client.on('ready',()=>{
    console.log("Redis listo")
})

redis_client.connect()

console.log('Redis conection: '+redis_client.isOpen);


var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);

const InventorySearch= grpc.loadPackageDefinition(packageDefinition).InventorySearch;

const client = new InventorySearch(
    "grpc_server:50051",
    grpc.credentials.createInsecure()
  );

const searchitems=(req,res)=>{
    const busqueda=req.query.q
    let cache = null;
    (async () => {
        let reply = await redis_client.get(busqueda);
        console.log(reply);
    
            if(reply){
                cache = JSON.parse(reply);
                console.log("Esta en cache :D")
                res.status(200).json(cache)
            }
            else{
                console.log("No esta en cache D:")
                client.GetServerResponse({message:busqueda}, (error,items) =>{
                    if(error){
                        console.log("error aaaa")
                        res.status(400).json(error);
                    }
                    else{
                        data = JSON.stringify(items)
                        redis_client.set(busqueda,data)
                        res.status(200).json(items);
            
                    }
                });
            } 
    })();
}





module.exports={
 searchitems
}