import React from 'react';
import { TouchableOpacity, Alert, Dimensions, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { promotionTableStyles } from './promotionTable.styled';
import Tooltip from '../Common/tooltip/Tooltip';
import {
  TableContextProvider,
  TableContent,
  Head,
  Body,
  Row,
  Cell,
  Footer
} from '../Common/managementTable';

const { width: screenWidth } = Dimensions.get('window');

interface PromocaoAdminItem {
  promocao_id: number;
  promocao_descricao?: string | null;
  fornecedor?: { pessoa_nome?: string };
  inicio: string | Date;
  fim?: string | Date | null;
  ativo: boolean;
}

interface PromotionTableProps {
  promocoes: PromocaoAdminItem[];
  onEdit: (item: PromocaoAdminItem) => void;
  onDelete: (item: PromocaoAdminItem) => void;
  refreshing: boolean;
  onRefresh: () => void;
}

const PromotionTable: React.FC<PromotionTableProps> = ({
  promocoes,
  onEdit,
  onDelete,
  refreshing,
  onRefresh,
}) => {
  const isEmpty = promocoes.length === 0;

  return (
    <TableContextProvider tableId="promotions-table">
      <TableContent
        isEmpty={isEmpty}
        emptyMessage="Ainda não há promoções cadastradas"
      >
        <Row isHeader>
          <Head limitWidth={60}>ID</Head>
          <Head>Descrição</Head>
          <Head>Fornecedor</Head>
          <Head align="center" limitWidth={100}>Início</Head>
          <Head align="center" limitWidth={100}>Fim</Head>
          <Head align="center" limitWidth={80}>Status</Head>
          <Head align="center" limitWidth={100}>Ações</Head>
        </Row>

        <Body>
          {promocoes.map((item, index) => (
            <Row key={item.promocao_id} index={index}>
              <Cell align="center" limitWidth={60}>
                {item.promocao_id}
              </Cell>
              <Cell>
                <Tooltip text={item.promocao_descricao || 'Sem descrição'} maxLength={screenWidth < 600 ? 20 : 40}>
                  {item.promocao_descricao || 'Sem descrição'}
                </Tooltip>
              </Cell>
              <Cell>
                <Tooltip text={item.fornecedor?.pessoa_nome || 'N/A'} maxLength={screenWidth < 600 ? 15 : 25}>
                  {item.fornecedor?.pessoa_nome || 'N/A'}
                </Tooltip>
              </Cell>
              <Cell align="center" limitWidth={100}>
                {new Date(item.inicio).toLocaleDateString('pt-BR')}
              </Cell>
              <Cell align="center" limitWidth={100}>
                {item.fim ? new Date(item.fim).toLocaleDateString('pt-BR') : '-'}
              </Cell>
              <Cell align="center" limitWidth={80}>
                <TouchableOpacity
                  style={[
                    promotionTableStyles.statusBadge,
                    item.ativo ? promotionTableStyles.activeBadge : promotionTableStyles.inactiveBadge
                  ]}
                  disabled
                >
                  <Text style={promotionTableStyles.statusText}>
                    {item.ativo ? 'Ativa' : 'Inativa'}
                  </Text>
                </TouchableOpacity>
              </Cell>
              <Cell align="center" limitWidth={100}>
                <TouchableOpacity
                  onPress={() => onEdit(item)}
                  style={[promotionTableStyles.actionButton, promotionTableStyles.editButton]}
                >
                  <Ionicons name="pencil-outline" size={16} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onDelete(item)}
                  style={[promotionTableStyles.actionButton, item.ativo ? promotionTableStyles.deleteButton : promotionTableStyles.activateButton]}
                >
                  <Ionicons name={item.ativo ? "trash-outline" : "checkmark-circle-outline"} size={16} color="white" />
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

export default PromotionTable;
