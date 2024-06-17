const {MongoClient, ServerApiVersion, Int32} = require("mongodb");
const express= require("express");
const app = express();
const { MONGODB_USR, MONGODB_PWD } =  require("./config.js");
const uri = "mongodb+srv://"+MONGODB_USR+":"+MONGODB_PWD+"@bd.m0u45gc.mongodb.net/?retryWrites=true&w=majority&appName=bd"
const client = new MongoClient(uri, {
  serverApi: {
   version: ServerApiVersion.v1,
   strict: true,
   deprecationErrors: true,
  },
});
const bd = client.db("basedatos");
const personas = bd.collection("personas");
const path = require("path");
const ejs = require("ejs");
const url = "/";
const PORT = process.env.PORT;

app.use(express.text());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/public', express.static('public'));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


async function run() {
   try {
     // Conecta el cliente al servidor
     await client.connect();
     // Envia un ping para confirmar una conexión exitosa
     await client.db("admin").command({ ping: 1 });
     console.log("Conexion a MongoDB exitosa !");
   }
   catch(error){
      // Asegura que el cliente se cerrará cuando de error
      await client.close()
     console.log("No se pudo conectar al servidor")
    }}
   run();

function collectionArray(){
   return personas.find({}).toArray();
}

function lastId(){
   return personas.find().map( function(p) { return p.userId } ).toArray()
}
app.get(url, async(req,res)=>{
   res.render("index");
});

app.get(url+"mostrar-empleados", async(req,res)=>{

   res.render("empleados", {
      persoas:await collectionArray(),
   });
});

app.get(url+"modificar/:id", async(req,res)=>{
   const user = await personas.findOne({ userId: parseInt(req.params.id) })
   console.log(user)
   res.render("modificar", {
      perso:await user
   });
});

app.get(url+"agregar-empleado", async(req,res)=>{

   res.render("agregarNuevo", {
      persoas:await collectionArray(),
   });

});

app.post(url+"creado", async (req, res) => {

  let valor;
  if (req.body.des === "true") valor = true;
  else valor = false;

  await personas.insertOne({
    profesion: req.body.profesion,
    remuneracion: new Int32(req.body.remu),
    userId: (await lastId()).at(-1) + 1,
    destacado: valor,
  });

  res.render("creado", {});

});

app.delete(url+"user/:userId", async(req,res)=> {

   await personas.deleteOne({userId:parseInt(req.params.userId)});
   res.render("index", {
      persoas: await collectionArray()
    });


});

app.get(url+"modificar",async(req,res)=>{
   res.render("borrarUser", {
      persoas: await collectionArray()
    });
});


app.put(url+":id/:nval/:profesi/:remunerado", async (req, res)=>{ 
      let valor;
      if (req.params.nval === "true") 
         valor = true;
      else 
      valor = false;

   await personas.updateOne({ userId: parseInt(req.params.id) }, 
   { $set: { destacado: Boolean (valor) } });
   await personas.updateOne({ userId: parseInt(req.params.id) }, 
   { $set: { profesion: req.params.profesi } }); 
   await personas.updateOne({ userId: parseInt(req.params.id) }, 
   { $set: { remuneracion: parseInt(req.params.remunerado) } }); 

   res.render("creado", {});
});

app.listen(PORT);
console.log(PORT+"creado");
console.log("Escuchando en puerto"+PORT);
