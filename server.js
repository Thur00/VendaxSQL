// Importa o módulo express, que é um framework web para Node.js
const express = require("express");
// Importa as classes Connection e Request do módulo tedious, que é um cliente TDS (Tabular Data Stream) para o Node.js
const { Connection, Request } = require("tedious");

// Cria uma instância do aplicativo express
const app = express();
// Define a porta em que o servidor irá escutar
const port = 3000;

// Configurações de conexão com o banco de dados
const config = {
  server: "localhost", // Nome do servidor
  authentication: {
    type: "default", // Tipo de autenticação
    options: {
      userName: "sa", // Nome de usuário
      password: "12345", // Senha
    },
  },
  options: {
    database: "VENDASX", // Nome do banco de dados
    trustServerCertificate: true, // Indica se deve confiar no certificado do servidor
  },
};

// Função assíncrona para conectar ao banco de dados
async function connectDatabase() {
  return new Promise((resolve, reject) => {
    const connection = new Connection(config); // Cria uma nova conexão com as configurações especificadas
    // Tenta estabelecer a conexão com o servidor
    connection.connect((err) => {
      if (err) {
        reject(err); // Rejeita a promessa se houver um erro na conexão
      } else {
        resolve(connection); // Resolve a promessa com a conexão estabelecida
      }
    });
  });
}

// Função assíncrona para executar uma consulta SQL e retornar os resultados
async function executeQuery(query) {
  const connection = await connectDatabase(); // Conecta ao banco de dados
  return new Promise((resolve, reject) => {
    const request = new Request(query, (err) => {
      if (err) {
        reject(err); // Rejeita a promessa se houver um erro na execução da consulta
      }
      connection.close(); // Fecha a conexão
    });

    let results = []; // Array para armazenar os resultados da consulta

    // Evento disparado para cada linha retornada pela consulta
    request.on("row", (columns) => {
      let row = {};
      // Itera sobre as colunas da linha
      columns.forEach((column) => {
        row[column.metadata.colName] = column.value; // Armazena o valor da coluna no objeto row
      });
      results.push(row); // Adiciona o objeto row ao array de resultados
    });

    // Evento disparado quando a solicitação de consulta é concluída
    request.on("requestCompleted", () => {
      resolve(results); // Resolve a promessa com os resultados da consulta
    });

    connection.execSql(request); // Executa a consulta SQL
  });
}

// Rota para a página inicial
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html"); // Envia o arquivo HTML da página inicial
});

// Rota para obter os produtos em formato JSON
app.get("/produtos", async (req, res) => {
  try {
    const query = "SELECT * FROM produtos;"; // Consulta SQL para selecionar todos os produtos
    const products = await executeQuery(query); // Executa a consulta SQL e aguarda os resultados
    res.json(products); // Retorna os produtos em formato JSON
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// Rota para obter as vendas em formato JSON
app.get("/vendas", async (req, res) => {
  try {
    const query = "SELECT * FROM Vendas;"; // Consulta SQL para selecionar todas as vendas
    const sales = await executeQuery(query); // Executa a consulta SQL e aguarda os resultados
    res.json(sales); // Retorna as vendas em formato JSON
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  } 
});

// Rota para obter uma venda pelo ID em formato JSON
app.get("/vendas/:id", async (req, res) => {
  try {
    const id = req.params.id; // Obtém o ID da venda da URL
    const query = `SELECT * FROM Vendas WHERE VendaID = ${id};`; // Consulta SQL para selecionar a venda pelo ID
    const sales = await executeQuery(query); // Executa a consulta SQL e aguarda os resultados
    if (sales.length === 0) {
      res.status(404).send("Venda não encontrada");
    } else {
      res.json(sales[0]); // Retorna a venda em formato JSON (supondo que apenas uma venda corresponda ao ID)
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// Inicia o servidor na porta especificada
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});