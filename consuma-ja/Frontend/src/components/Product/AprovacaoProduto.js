const API_URL = 'http://localhost:3000/produtos';

async function listarProdutosPendentes() {
  try {
    const response = await fetch(`${API_URL}/pend/`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const produtos = await response.json();
    criarTabela(produtos);
  } catch (error) {
    console.error('Erro ao listar produtos pendentes:', error);
  }
}

function criarTabela(produtos) {
  const tabela = document.createElement('table');
  tabela.style.width = '100%';
  tabela.style.borderCollapse = 'collapse';

  const cabecalho = tabela.createTHead();
  const linhaCabecalho = cabecalho.insertRow();
  ['Nome do Produto', 'Aprovar', 'Rejeitar'].forEach(texto => {
    const th = document.createElement('th');
    th.textContent = texto;
    th.style.border = '1px solid black';
    th.style.padding = '8px';
    th.style.textAlign = 'left';
    linhaCabecalho.appendChild(th);
  });

  const corpo = tabela.createTBody();
  produtos.forEach(produto => {
    const linha = corpo.insertRow();
    const colunaNome = linha.insertCell();
    const colunaAprovar = linha.insertCell();
    const colunaRejeitar = linha.insertCell();

    colunaNome.textContent = produto.nome;
    colunaAprovar.innerHTML = `<button onclick="aprovarProduto(${produto.id})">Aprovar</button>`;
    colunaRejeitar.innerHTML = `<button onclick="rejeitarProduto(${produto.id})">Rejeitar</button>`;

    [colunaNome, colunaAprovar, colunaRejeitar].forEach(coluna => {
      coluna.style.border = '1px solid black';
      coluna.style.padding = '8px';
    });
  });

  // Adicione a tabela a um elemento existente no seu DOM
  // Por exemplo, se você tiver um elemento com o id "tabela-container":
  document.getElementById('tabela-container').appendChild(tabela);
}

async function aprovarProduto(produtoId) {
  try {
    await fetch(`${API_URL}/prod/${produtoId}/aprovar`, { method: 'PUT' });
    listarProdutosPendentes(); // Atualiza a tabela após a aprovação
  } catch (error) {
    console.error('Erro ao aprovar produto:', error);
  }
}

async function rejeitarProduto(produtoId) {
  const motivoRejeicao = prompt('Motivo da rejeição:');
  if (!motivoRejeicao) return; // Se o usuário cancelar o prompt
  try {
    await fetch(`${API_URL}/prod/${produtoId}/rejeitar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ motivoRejeicao })
    });
    listarProdutosPendentes(); // Atualiza a tabela após a rejeição
  } catch (error) {
    console.error('Erro ao rejeitar produto:', error);
  }
}

listarProdutosPendentes(); // Carrega os dados ao carregar a página