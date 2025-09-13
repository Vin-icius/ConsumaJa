import { Platform, StyleSheet } from "react-native";

export const navigatorStyles = StyleSheet.create({
  // Estilos para o drawer personalizado
  drawerContainer: {
    flex: 1,
    backgroundColor: "#2F4F4F",
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 16, // Aumenta o padding no Android
    backgroundColor: "#4CAF50",
  },
  drawerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  menuScrollView: {
    flex: 1,
  },
  sectionHeader: {
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#aaa",
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  submenuItem: {
    paddingLeft: 32, // Mais indentado para itens do dropdown
  },
  activeMenuItem: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
  },
  menuItemText: {
    color: "white",
    fontSize: 16,
    marginLeft: 16,
  },
  activeMenuItemText: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#555",
    marginVertical: 8,
    marginHorizontal: 16,
  },
  logoutButtonContainer: {
    paddingBottom: Platform.OS === 'android' ? 20 : 10, // Adiciona padding extra no Android
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#555",
  },
  logoutText: {
    color: "white",
    fontSize: 16,
    marginLeft: 16,
  },

  // Estilos originais para LogoutScreen
  logoutContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    paddingTop: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    marginBottom: 8
  },
})