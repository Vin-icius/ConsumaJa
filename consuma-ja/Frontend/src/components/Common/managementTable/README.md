# Management Table Component

Um componente global e reutilizável para criar tabelas padronizadas em React Native.

## Estrutura dos Componentes

### TableContextProvider
Fornece o contexto para a tabela, gerenciando estado global da tabela.

```tsx
<TableContextProvider tableId="minha-tabela">
  {/* Conteúdo da tabela */}
</TableContextProvider>
```

### TableContent
Container principal da tabela com estilos base.

### Head
Cabeçalho da tabela. Deve ser usado dentro de uma Row com `isHeader={true}`.

```tsx
<Head align="center" bold={true} limitWidth={100}>
  Título da Coluna
</Head>
```

**Props:**
- `align?: 'left' | 'center' | 'right'` - Alinhamento do texto
- `bold?: boolean` - Texto em negrito
- `italic?: boolean` - Texto em itálico
- `size?: 'small' | 'normal' | 'large'` - Tamanho do texto
- `limitWidth?: number` - Largura máxima em pixels
- `limitHeight?: number` - Altura máxima em pixels

### Body
Corpo da tabela, container para as linhas de dados.

### Row
Linha da tabela. Use `isHeader={true}` para cabeçalhos.

```tsx
<Row isHeader={true}>
  <Head>Coluna 1</Head>
  <Head>Coluna 2</Head>
</Row>

<Row index={0}>
  <Cell>Dado 1</Cell>
  <Cell>Dado 2</Cell>
</Row>
```

### Cell
Célula da tabela com conteúdo de dados.

```tsx
<Cell align="center" limitWidth={100}>
  Conteúdo da célula
</Cell>
```

**Props:** Mesmas do Head, exceto que `isHeader` não se aplica.

### Footer
Rodapé da tabela. Por padrão mostra informações sobre linhas e colunas.

## Exemplo de Uso Completo

```tsx
import {
  TableContextProvider,
  TableContent,
  Head,
  Body,
  Row,
  Cell,
  Footer
} from '../Common/managementTable';

const MinhaTabela = ({ dados }) => {
  return (
    <TableContextProvider tableId="minha-tabela">
      <TableContent>
        <Row isHeader>
          <Head limitWidth={60}>ID</Head>
          <Head>Nome</Head>
          <Head align="center" limitWidth={100}>Status</Head>
          <Head align="center" limitWidth={120}>Ações</Head>
        </Row>

        <Body>
          {dados.map((item, index) => (
            <Row key={item.id} index={index}>
              <Cell align="center" limitWidth={60}>
                {item.id}
              </Cell>
              <Cell>
                {item.nome}
              </Cell>
              <Cell align="center" limitWidth={100}>
                <Text style={{ color: item.ativo ? 'green' : 'red' }}>
                  {item.ativo ? 'Ativo' : 'Inativo'}
                </Text>
              </Cell>
              <Cell align="center" limitWidth={120}>
                <TouchableOpacity>
                  <Text>Editar</Text>
                </TouchableOpacity>
              </Cell>
            </Row>
          ))}
        </Body>

        <Footer />
      </TableContent>
    </TableContextProvider>
  );
};
```

## Estilos

Os estilos são definidos em `tableStyles.ts` e incluem:

- Layout responsivo
- Cores alternadas para linhas pares/ímpares
- Estilos para diferentes tamanhos de texto
- Alinhamentos de texto
- Larguras e alturas limitadas
- Sombras e bordas

## Funcionalidades

- **Contexto Global**: Estado compartilhado entre componentes da tabela
- **Responsividade**: Adapta-se a diferentes tamanhos de tela
- **Customização**: Props extensivas para personalização
- **Acessibilidade**: Estrutura semântica clara
- **Performance**: Renderização otimizada

## Problemas Resolvidos

1. **Busca Automática**: Implementado debounce de 500ms para busca automática enquanto o usuário digita
2. **Limite de Produtos**: Verificado que o limite é de 15 produtos (não há restrição artificial)
3. **Validação de Dados**: Melhorada validação de dados na edição de promoções

## Notas de Implementação

- O contexto conta automaticamente colunas e linhas
- As linhas têm cores alternadas automaticamente
- O footer mostra estatísticas da tabela por padrão
- Componentes são totalmente customizáveis via props</content>
<parameter name="filePath">d:\ConsumaJa\EstagioConsumaJa\ConsumaJa\consuma-ja\Frontend\src\components\Common\managementTable\README.md
