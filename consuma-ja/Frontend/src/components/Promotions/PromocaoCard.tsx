"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Image, useWindowDimensions, Platform } from "react-native"
import { Ionicons } from "@expo/vector-icons"

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
  const isMobile = width < 600

  // Estado para controlar o item atual no carrossel
  const [currentItemIndex, setCurrentItemIndex] = useState(0)

  // Verifica se há itens para exibir
  const hasItems = itens_preview && itens_preview.length > 0

  // Item atual a ser exibido no carrossel
  const currentItem = hasItems ? itens_preview[currentItemIndex] : null

  // Função para navegar para o próximo item
  const nextItem = () => {
    if (hasItems) {
      setCurrentItemIndex((prevIndex) => (prevIndex + 1) % itens_preview.length)
    }
  }

  // Função para navegar para o item anterior
  const prevItem = () => {
    if (hasItems) {
      setCurrentItemIndex((prevIndex) => (prevIndex - 1 + itens_preview.length) % itens_preview.length)
    }
  }

  // Encontra o menor preço entre os itens
  const menorPreco = itens_preview.reduce(
    (min, item) => (item.itemPromocao_valor < min ? item.itemPromocao_valor : min),
    itens_preview[0]?.itemPromocao_valor || 0,
  )

  return (
    <TouchableOpacity style={styles.card} onPress={onPressDetalhes} activeOpacity={0.7}>
      {/* Cabeçalho do Card */}
      <View style={styles.cardHeader}>
        <Text style={styles.promocaoTitulo} numberOfLines={2}>
          {promocao_descricao || "Promoção"}
        </Text>
      </View>

      {/* Fornecedor */}
      <View style={styles.fornecedorContainer}>
        <Ionicons name="business-outline" size={16} color="#666" />
        <Text style={styles.fornecedorNome} numberOfLines={1}>
          {fornecedor.pessoa_nome}
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Carrossel de Itens */}
      <View style={styles.carouselContainer}>
        {hasItems ? (
          <>
            <TouchableOpacity
              style={[styles.carouselButton, styles.carouselButtonLeft]}
              onPress={prevItem}
              disabled={itens_preview.length <= 1}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={20} color={itens_preview.length > 1 ? "#007bff" : "#ccc"} />
            </TouchableOpacity>

            <View style={styles.itemContainer}>
              {currentItem?.imagem_url ? (
                <Image source={{ uri: currentItem.imagem_url }} style={styles.itemImage} />
              ) : (
                <View style={styles.itemImagePlaceholder}>
                  <Ionicons name="image-outline" size={24} color="#aaa" />
                </View>
              )}

              <View style={styles.itemInfo}>
                <Text style={styles.itemNome} numberOfLines={2}>
                  {currentItem?.produto_nome}
                </Text>
                <Text style={styles.itemPreco}>R$ {currentItem?.itemPromocao_valor.toFixed(2)}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.carouselButton, styles.carouselButtonRight]}
              onPress={nextItem}
              disabled={itens_preview.length <= 1}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={20} color={itens_preview.length > 1 ? "#007bff" : "#ccc"} />
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.noItemsContainer}>
            <Ionicons name="alert-circle-outline" size={24} color="#aaa" />
            <Text style={styles.noItemsText}>Nenhum item disponível</Text>
          </View>
        )}
      </View>

      {/* Indicador de Página */}
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

      {/* Rodapé do Card */}
      <View style={styles.cardFooter}>
        <View style={styles.precoContainer}>
          <Text style={styles.aPartirDe}>A partir de</Text>
          <Text style={styles.precoDestaque}>R$ {menorPreco.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.detalhesButton} onPress={onPressDetalhes}>
          <Text style={styles.detalhesButtonText}>Ver Detalhes</Text>
        </TouchableOpacity>
      </View>

      {/* Contador de Itens */}
      {itens_preview.length > 0 && (
        <View style={styles.itemCountContainer}>
          <Text style={styles.itemCountText}>
            {currentItemIndex + 1}/{itens_preview.length} itens
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "100%",
    height: Platform.OS === "web" ? 320 : "auto", // Altura fixa para web, auto para mobile
    position: "relative",
  },
  cardHeader: {
    marginBottom: 8,
  },
  promocaoTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  fornecedorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  fornecedorNome: {
    fontSize: 14,
    color: "#666",
    marginLeft: 6,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 8,
  },
  carouselContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 120,
    marginVertical: 10,
    position: "relative",
  },
  carouselButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  carouselButtonLeft: {
    position: "absolute",
    left: -5,
    top: "50%",
    marginTop: -15,
  },
  carouselButtonRight: {
    position: "absolute",
    right: -5,
    top: "50%",
    marginTop: -15,
  },
  itemContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemNome: {
    fontSize: 16,
    color: "#333",
    marginBottom: 6,
  },
  itemPreco: {
    fontSize: 16,
    color: "#28a745",
    fontWeight: "500",
  },
  noItemsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noItemsText: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 8,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
    marginBottom: 10,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ddd",
    marginHorizontal: 3,
  },
  paginationDotActive: {
    backgroundColor: "#007bff",
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  precoContainer: {
    flexDirection: "column",
  },
  aPartirDe: {
    fontSize: 12,
    color: "#666",
  },
  precoDestaque: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#28a745",
  },
  detalhesButton: {
    backgroundColor: "#007bff",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  detalhesButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  itemCountContainer: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  itemCountText: {
    fontSize: 12,
    color: "#666",
  },
})

export default PromocaoCard
