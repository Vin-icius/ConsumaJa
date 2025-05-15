"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, useWindowDimensions, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import MarqueeText from "./MarqueeText" // Importação corrigida para o mesmo diretório

// Tipos
interface PromocaoCardProps {
  promocao_id: number
  promocao_descricao?: string
  fornecedor: { pessoa_id: number; pessoa_nome: string }
  itens_preview: Array<{ produto_id: number; produto_nome: string; itemPromocao_valor: number; imagem_url?: string }>
  onPressDetalhes: () => void
}

const PromocaoCard = ({ promocao_descricao, fornecedor, itens_preview, onPressDetalhes }: PromocaoCardProps) => {
  const { width } = useWindowDimensions()
  const isMobile = width < 768

  // Estado para controlar o item atual no carrossel
  const [currentItemIndex, setCurrentItemIndex] = useState(0)

  // Verifica se há itens para exibir
  const hasItems = itens_preview && itens_preview.length > 0

  // Item atual a ser exibido no carrossel
  const currentItem = hasItems ? itens_preview[currentItemIndex] : null

  // Função para navegar para o próximo item
  const nextItem = (e?: any) => {
    if (e) e.stopPropagation()
    if (hasItems) {
      setCurrentItemIndex((prevIndex) => (prevIndex + 1) % itens_preview.length)
    }
  }

  // Função para navegar para o item anterior
  const prevItem = (e?: any) => {
    if (e) e.stopPropagation()
    if (hasItems) {
      setCurrentItemIndex((prevIndex) => (prevIndex - 1 + itens_preview.length) % itens_preview.length)
    }
  }

  // Encontra o menor preço entre os itens (com verificação de segurança)
  const menorPreco = hasItems
    ? itens_preview.reduce((min, item) => {
        const valor = item.itemPromocao_valor !== undefined ? item.itemPromocao_valor : Number.POSITIVE_INFINITY
        return valor < min ? valor : min
      }, Number.POSITIVE_INFINITY)
    : 0

  return (
    <TouchableOpacity style={styles.card} onPress={onPressDetalhes} activeOpacity={0.7}>
      {/* Seção de Imagem com Carrossel */}
      <View style={styles.imageSection}>
        {hasItems ? (
          <>
            {currentItem?.imagem_url ? (
              <Image source={{ uri: currentItem.imagem_url }} style={styles.itemImage} resizeMode="cover" />
            ) : (
              <View style={styles.itemImagePlaceholder}>
                <Ionicons name="image-outline" size={32} color="#aaa" />
              </View>
            )}

            {/* Botões de navegação do carrossel */}
            {itens_preview.length > 1 && (
              <>
                <TouchableOpacity
                  style={[styles.carouselButton, styles.carouselButtonLeft]}
                  onPress={prevItem}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-back" size={18} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.carouselButton, styles.carouselButtonRight]}
                  onPress={nextItem}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-forward" size={18} color="#fff" />
                </TouchableOpacity>
              </>
            )}

            {/* Indicador de quantidade de itens */}
            {itens_preview.length > 1 && (
              <View style={styles.itemCountBadge}>
                <Text style={styles.itemCountText}>
                  {currentItemIndex + 1}/{itens_preview.length}
                </Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.itemImagePlaceholder}>
            <Ionicons name="image-outline" size={32} color="#aaa" />
            <Text style={styles.noItemsText}>Sem imagem</Text>
          </View>
        )}
      </View>

      {/* Seção de Informações */}
      <View style={styles.infoSection}>
        {/* Título da Promoção com animação de marquee */}
        <MarqueeText
          text={promocao_descricao || "Promoção"}
          style={styles.promocaoTitulo}
          speed={0.03} // Velocidade mais rápida
          delay={1000} // Pausa de 1 segundo antes de iniciar a animação
        />

        {/* Preço */}
        <Text style={styles.precoDestaque}>
          A partir de R$ {menorPreco !== Number.POSITIVE_INFINITY ? menorPreco.toFixed(2) : "0.00"}
        </Text>

        {/* Nome do Item Atual - limitado a 2 linhas com "..." */}
        {currentItem && (
          <Text style={styles.itemNome} numberOfLines={2} ellipsizeMode="tail">
            {currentItem.produto_nome}
          </Text>
        )}

        {/* Fornecedor - com espaço reduzido */}
        <View style={styles.fornecedorContainer}>
          <Ionicons name="business-outline" size={14} color="#666" />
          <Text style={styles.fornecedorNome} numberOfLines={1} ellipsizeMode="tail">
            {fornecedor.pessoa_nome}
          </Text>
        </View>

        {/* Indicador de Página (pontos) */}
        {itens_preview.length > 1 && (
          <View style={styles.paginationContainer}>
            {itens_preview.map((_, index) => (
              <View
                key={index}
                style={[styles.paginationDot, index === currentItemIndex && styles.paginationDotActive]}
              />
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "100%",
    height: Platform.OS === "web" ? 320 : 320, // Altura fixa para todos os dispositivos
  },
  imageSection: {
    position: "relative",
    width: "100%",
    height: 160, // Altura fixa para a seção de imagem
    backgroundColor: "#f8f8f8",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  itemImagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  noItemsText: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 8,
  },
  carouselButton: {
    position: "absolute",
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    top: "50%",
    marginTop: -14,
    zIndex: 2,
  },
  carouselButtonLeft: {
    left: 8,
  },
  carouselButtonRight: {
    right: 8,
  },
  itemCountBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemCountText: {
    fontSize: 12,
    color: "#fff",
  },
  infoSection: {
    padding: 12,
    height: 160, // Altura fixa para a seção de informações
    justifyContent: "flex-start", // Alinha os itens no topo
  },
  promocaoTitulo: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
    height: 20, // Altura fixa para o título
  },
  precoDestaque: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#28a745",
    marginBottom: 4, // Reduzido de 6 para 4
  },
  itemNome: {
    fontSize: 13,
    color: "#555",
    marginBottom: 4, // Reduzido de 8 para 4
    height: 32, // Altura fixa para o nome do item (2 linhas)
  },
  fornecedorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2, // Reduzido de 4 para 2
  },
  fornecedorNome: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
    flex: 1,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6, // Reduzido de 8 para 6
    position: "absolute",
    bottom: 8,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#ddd",
    marginHorizontal: 2,
  },
  paginationDotActive: {
    backgroundColor: "#007bff",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
})

export default PromocaoCard
