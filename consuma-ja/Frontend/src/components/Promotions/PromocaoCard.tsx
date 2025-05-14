// src/components/Promotions/PromocaoCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Tipos mantidos
interface PromocaoPreviewItem {
    produto_id: number;
    produto_nome: string;
    itemPromocao_valor: number;
    produto_imagem_url?: string | null;
}
interface PromocaoCardProps {
  promocao_id: number;
  promocao_descricao?: string | null;
  fornecedor: {
    pessoa_id: number;
    pessoa_nome: string;
  };
  itens_preview: PromocaoPreviewItem[];
  onPressDetalhes: () => void;
}

// --- AJUSTES DE TAMANHO PARA LAYOUT EM GRADE ---
const { width: screenWidth } = Dimensions.get('window');
// Considerar padding da FlatList e espaço entre os cards
const listHorizontalPadding = 10; // Padding da FlatList em cada lado
const spaceBetweenCards = 10;    // Espaço entre os dois cards na mesma linha
const cardWidth = (screenWidth - (listHorizontalPadding * 2) - spaceBetweenCards) / 2;

// Ajustar o tamanho das imagens de preview DENTRO do card menor
// Vamos tentar mostrar apenas UMA imagem de preview para simplificar no card menor.
// Se quiser duas, o tamanho precisará ser ainda menor.
const cardInternalPadding = 8;
const productImageWidth = cardWidth - (cardInternalPadding * 2);
const productImageHeight = productImageWidth * 0.75; // Proporção 4:3 para a imagem

const PromocaoCard: React.FC<PromocaoCardProps> = ({ promocao_id, promocao_descricao, fornecedor, itens_preview, onPressDetalhes }) => {
  const firstItemPreview = (itens_preview || [])[0]; // Pega o primeiro item para preview

  return (
    // Aplicar a nova largura calculada ao estilo do card
    <TouchableOpacity style={[styles.card, { width: cardWidth }]} onPress={onPressDetalhes}>
      {/* Mostra a imagem do primeiro item, se existir */}
      {firstItemPreview && (
        <Image
          source={firstItemPreview.produto_imagem_url ? { uri: firstItemPreview.produto_imagem_url } : require('../../assets/placeholder.png')}
          style={styles.mainProductImage}
          resizeMode="contain"
        />
      )}
      {!firstItemPreview && ( // Placeholder se não houver itens para preview
          <View style={[styles.mainProductImage, styles.imagePlaceholderView]}>
            <Ionicons name="images-outline" size={40} color="grey" />
          </View>
      )}

      <View style={styles.cardContent}>
        <Text style={styles.supplierName} numberOfLines={1}>{fornecedor.pessoa_nome}</Text>
        {promocao_descricao && (
            <Text style={styles.promotionTitle} numberOfLines={2}>{promocao_descricao}</Text>
        )}

        {/* Mostrar preço do primeiro item se existir */}
        {firstItemPreview && (
            <Text style={styles.productPrice}>R$ {Number(firstItemPreview.itemPromocao_valor).toFixed(2)}</Text>
        )}
        {/* Indicar se há mais itens */}
        {(itens_preview || []).length > 1 && (
            <Text style={styles.moreItemsTextSmall}>+{ (itens_preview || []).length -1 } outros itens</Text>
        )}
         {(itens_preview || []).length === 0 && (
            <Text style={styles.moreItemsTextSmall}>Ver itens</Text>
         )}

      </View>
      {/* Botão/Link "Ver Detalhes" pode ser removido se o card inteiro for clicável
          ou estilizado de forma diferente */}
      {/* <View style={styles.detailsButton}>
        <Text style={styles.viewDetailsText}>Ver Detalhes</Text>
        <Ionicons name="arrow-forward" size={16} color="#007bff" />
      </View> */}
    </TouchableOpacity>
  );
};

// --- ESTILOS AJUSTADOS ---
const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    // paddingHorizontal e paddingVertical agora são menores
    // A largura é definida dinamicamente
    marginBottom: spaceBetweenCards, // Espaço abaixo do card
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    // MarginHorizontal é controlada pelo columnWrapperStyle da FlatList ou pelo espaçamento
    // marginRight: spaceBetweenCards / 2, // Se for aplicar espaçamento individualmente
    // marginLeft: spaceBetweenCards / 2,
  },
  mainProductImage: {
    width: '100%', // Ocupa toda a largura do card (menos padding interno se houver)
    height: productImageHeight, // Altura calculada
    borderTopLeftRadius: 8, // Arredonda cantos superiores se for a primeira coisa no card
    borderTopRightRadius: 8,
    backgroundColor: '#f8f8f8',
  },
  imagePlaceholderView: {
      justifyContent: 'center',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
  },
  cardContent: {
    padding: cardInternalPadding, // Padding interno para o conteúdo
  },
  supplierName: {
    fontSize: 14, // Reduzido
    fontWeight: '600', // Um pouco menos bold
    color: '#333',
    marginBottom: 2,
  },
  promotionTitle: {
    fontSize: 12, // Reduzido
    color: '#555',
    marginBottom: 4,
    lineHeight: 16, // Ajustado
  },
  productPrice: {
    fontSize: 15, // Pode manter ou reduzir ligeiramente
    fontWeight: 'bold',
    color: '#27ae60',
    marginTop: 4,
  },
  moreItemsTextSmall: {
      fontSize: 11,
      color: '#007bff',
      marginTop: 3,
      textAlign: 'right'
  },
  // productPreviewContainer, productPreview, productNamePreview, moreItemsIndicator foram simplificados/removidos
  // para um preview de apenas 1 imagem principal no card.

  // detailsButton e viewDetailsText podem ser removidos se o card inteiro for clicável
  // ou precisarão de um design que caiba no card menor.
});

export default PromocaoCard;