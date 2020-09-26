const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database");
const Pergunta = require("./database/Pergunta");
const Resposta = require("./database/Resposta");

//Database
connection.authenticate().then(() =>{
    console.log("Conexao feita com banco de dados")
}).catch((err) =>{
    console.log("erro");
})

//comunicando o express para usar o EJS como renderizador de html
app.set('view engine', 'ejs');
app.use(express.static('public'));
//linkar ao express

app.use(bodyParser.urlencoded({extended: false}));
//permitir a leitura de dados enviados via json EM API
app.use(bodyParser.json())

app.get("/",(req, res) =>{
    Pergunta.findAll({
        raw:true, order:[
            ['id','DESC']
        ]
    }).then(perguntas =>{
        res.render("index",{
            //criando variavel para receber as perguntas
            perguntas: perguntas
        });
    })
   
});

app.get("/perguntar", (req, res) =>{
    res.render("perguntar");
})

app.post("/salvarpergunta", (req, res) =>{
    var titulo = req.body.titulo;
    var descricao = req.body.descricao;
    Pergunta.create({
        titulo: titulo,
        descricao : descricao
    }).then(() =>{
        res.redirect("/");
    })
});

app.get("/pergunta/:id", (req,res) =>{
    var id = req.params.id;
    Pergunta.findOne({
        where: {
            id:id
            //variavel escolhida = variavel do banco
        }
    }).then(pergunta =>{
        if(pergunta != undefined){

            Resposta.findAll({
                where: {perguntaId:pergunta.id},
                order: [
                    ['id', 'DESC']
                ]
            }).then(respostas =>{
                 //Pergunta achada
            res.render("pergunta", {
                pergunta: pergunta,
                respostas: respostas
            });
            })
      
        }else{
            //Pergunta nao encontrada
            res.redirect("/");
        }
    })
})
app.post("/responder", (req, res) =>{
    var corpo = req.body.corpo;
    var perguntaId = req.body.pergunta;

    Resposta.create({
        corpo: corpo,
        perguntaId: perguntaId
    }).then(() =>{
        res.redirect("/pergunta/" +perguntaId);;
        //acima estamos redirecionando para a pergunta respondida
    })
})



app.listen(8080, () =>{
    console.log("App rodando");
});