import express from 'express';
import produtoRoutes from './interfaces/routes/produto.routes';
import tipoRoutes from './interfaces/routes/tipo.routes';
import categoriaRoutes from './interfaces/routes/categoria.routes';
import marcaRoutes from './interfaces/routes/marca.routes';

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Permite requisições de qualquer origem
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use('/produtos', produtoRoutes);
app.use('/tipos', tipoRoutes);
app.use('/marcas', marcaRoutes);
app.use('/categorias', categoriaRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});