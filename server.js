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

// Rota para obter a pagina dos clientes
app.get("/clientes", async (req, res) => {
  try {
    res.sendFile(__dirname + "/public/clientes.html"); // Retorna a pagina das clientes
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// Rota para obter uma venda pelo ID em formato JSON
app.get("/clientes/:id", async (req, res) => {
  try {
    const id = req.params.id; // Obtém o ID do cliente da URL
    const query = `SELECT * FROM clientes WHERE cliente_id = ${id};`; // Consulta SQL para selecionar o cliente pelo ID
    const sales = await executeQuery(query); // Executa a consulta SQL e aguarda os resultados
    if (sales.length === 0) {
      res.status(404).send("Cliente não encontrada");
    } else {
      res.json(sales[0]); // Retorna o cliente em formato JSON (supondo que apenas uma venda corresponda ao ID)
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// Rota para obter a pagina dos vendedores
app.get("/vendedores", async (req, res) => {
  try {
    res.sendFile(__dirname + "/public/vendedor.html"); // Retorna as vendedores em formato JSON
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// Rota para obter uma venda pelo ID em formato JSON
app.get("/vendedores/:id", async (req, res) => {
  try {
    const id = req.params.id; // Obtém o ID do vendedor da URL
    const query = `SELECT * FROM vendedores WHERE vendedor_id = ${id};`; // Consulta SQL para selecionar a vendedor pelo ID
    const sales = await executeQuery(query); // Executa a consulta SQL e aguarda os resultados
    if (sales.length === 0) {
      res.status(404).send("Vendedor não encontrado");
    } else {
      res.json(sales[0]); // Retorna a vendedor em formato JSON (supondo que apenas uma vendedor corresponda ao ID)
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// Rota para obter a pagina das vendas
app.get("/vendas", async (req, res) => {
  try {
    res.sendFile(__dirname + "/public/venda.html"); // Retorna a pagina das vendas
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

// Rota para obter uma venda pelo ID em formato JSON
app.get("/vendas/:id", async (req, res) => {
  try {
    const id = req.params.id; // Obtém o ID da venda da URL
    const query = `SELECT * FROM Vendas WHERE venda_id = ${id};`; // Consulta SQL para selecionar a venda pelo ID
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