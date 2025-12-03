import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Tooltip from '../Common/tooltip/Tooltip';
import {
  TableContextProvider,
  TableContent,
  Head,
  Body,
  Row,
  Cell,
  Footer,
} from '../Common/managementTable';
import { productTableStyles } from './productTable.styled';
import { tableStyles } from '../Common/managementTable/tableStyles';

export interface SupplierSummary {
  pessoa_id?: number;
  pessoa_nome?: string;
  fornecedor_num?: number | null;
}

export interface ProductTableItem {
  produto_id: number;
  produto_nome: string;
  produto_status: 'APROVADO' | 'PENDENTE' | 'REJEITADO';
  produto_precoOriginal: number;
  ativo: boolean;
  categoria?: { categoria_nome?: string | null } | null;
  marca?: { marca_nome?: string | null } | null;
  tipo?: { tipo_nome?: string | null } | null;
  fornecedor?: SupplierSummary | null;
  fornecedor_nome?: string | null;
}

interface ProductTableProps {
  produtos: ProductTableItem[];
  isAdminView: boolean;
  onEdit: (item: ProductTableItem) => void;
  onDeactivate: (item: ProductTableItem) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const statusStyleMap = {
  APROVADO: productTableStyles.statusApproved,
  PENDENTE: productTableStyles.statusPending,
  REJEITADO: productTableStyles.statusRejected,
} as const;

export const ProductTable: React.FC<ProductTableProps> = ({ produtos, isAdminView, onEdit, onDeactivate }) => {
  const isEmpty = produtos.length === 0;

  const resolveSupplierName = (item: ProductTableItem) =>
    item.fornecedor?.pessoa_nome || item.fornecedor_nome || '—';

  return (
    <TableContextProvider tableId="product-table">
      <TableContent
        isEmpty={isEmpty}
        emptyMessage="Ainda não há produtos cadastrados"
      >
        <Row isHeader>
          <Head align="center" limitWidth={60}>
            ID
          </Head>
          <Head>Produto</Head>
          {isAdminView && <Head>Fornecedor</Head>}
          <Head>Categoria</Head>
          <Head>Marca</Head>
          <Head>Tipo</Head>
          <Head limitWidth={120}>
            Preço
          </Head>
          <Head align="center" limitWidth={140}>
            Status
          </Head>
          <Head align="center" limitWidth={140}>
            Ações
          </Head>
        </Row>

        <Body>
          {produtos.map((produto, index) => (
            <Row key={produto.produto_id} index={index}>
              <Cell align="center" limitWidth={60}>
                {produto.produto_id}
              </Cell>
              <Cell>
                <Tooltip text={produto.produto_nome} maxLength={36}>
                  {produto.produto_nome}
                </Tooltip>
              </Cell>
              {isAdminView && (
                <Cell>
                  <Tooltip text={resolveSupplierName(produto)} maxLength={28}>
                    {resolveSupplierName(produto)}
                  </Tooltip>
                </Cell>
              )}
              <Cell>
                {produto.categoria?.categoria_nome || '—'}
              </Cell>
              <Cell>
                {produto.marca?.marca_nome || '—'}
              </Cell>
              <Cell>
                {produto.tipo?.tipo_nome || '—'}
              </Cell>
              <Cell limitWidth={120}>
                <Text style={productTableStyles.priceText}>{formatCurrency(produto.produto_precoOriginal)}</Text>
              </Cell>

              <View style={[tableStyles.bodyCell, productTableStyles.statusColumn, { maxWidth: 140 }]}>
                <View
                  style={[
                    productTableStyles.statusPill,
                    statusStyleMap[produto.produto_status] || productTableStyles.statusPending,
                  ]}
                >
                  <Text style={productTableStyles.statusLabel}>{produto.produto_status}</Text>
                </View>
                <View
                  style={[
                    productTableStyles.statusPill,
                    produto.ativo ? productTableStyles.activePill : productTableStyles.inactivePill,
                  ]}
                >
                  <Text style={productTableStyles.statusLabel}>{produto.ativo ? 'Ativo' : 'Inativo'}</Text>
                </View>
              </View>

              <View style={[tableStyles.bodyCell, productTableStyles.actionsWrapper, { maxWidth: 140 }]}>
                <TouchableOpacity
                  style={[productTableStyles.actionButton, productTableStyles.editButton]}
                  onPress={() => onEdit(produto)}
                >
                  <Ionicons name="pencil" size={18} color="#fff" />
                </TouchableOpacity>

                {produto.ativo ? (
                  <TouchableOpacity
                    style={[productTableStyles.actionButton, productTableStyles.deleteButton]}
                    onPress={() => onDeactivate(produto)}
                  >
                    <Ionicons name="trash" size={18} color="#fff" />
                  </TouchableOpacity>
                ) : (
                  <View style={[productTableStyles.actionButton, productTableStyles.disabledButton]}>
                    <Ionicons name="lock-closed" size={18} color="#fff" />
                  </View>
                )}
              </View>
            </Row>
          ))}
        </Body>

        <Footer showInfo={false} />
      </TableContent>
    </TableContextProvider>
  );
};

export default ProductTable;
