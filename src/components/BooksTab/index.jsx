import React, { useEffect, useState } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  BOOK_CATEGORIES,
  BOOKS_CATALOG,
  getWeeklyFeaturedBooks,
} from "../../Database/BooksData";
import HabitsService from "../../services/HabitsService";
import SoundService from "../../services/SoundService";
import CyberModal from "../Common/CyberModal";

export default function BooksTab({ onAddHabit }) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [activeView, setActiveView] = useState("catalog"); // 'catalog' ou 'wishlist'
  const [wishlist, setWishlist] = useState([]);
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info",
    confirmText: "ENTENDIDO",
    onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
  });

  const weeklyInfo = getWeeklyFeaturedBooks();

  const loadWishlist = async () => {
    try {
      const items = await HabitsService.getBookInterests();
      setWishlist(items);
    } catch (e) {
      console.warn("Erro ao carregar lista de interesses:", e);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const isBookInWishlist = (bookId) => {
    return wishlist.some((item) => item.id === bookId);
  };

  const handleToggleWishlist = async (book) => {
    SoundService.playClick();
    try {
      if (isBookInWishlist(book.id)) {
        await HabitsService.removeBookInterest(book.id);
        setWishlist((prev) => prev.filter((item) => item.id !== book.id));
      } else {
        await HabitsService.addBookInterest(book);
        setWishlist((prev) => [
          {
            id: book.id,
            title: book.title,
            author: book.author,
            category: book.category,
            buyUrl: book.buyUrl,
            addedDate: new Date().toISOString(),
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.warn("Erro ao alternar interesse do livro:", err);
    }
  };

  const handleOpenStore = async (url) => {
    SoundService.playClick();
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (e) {
      console.warn("Não foi possível abrir o link da livraria:", e);
    }
  };

  const handleAddHabit = (book) => {
    SoundService.playClick();
    if (onAddHabit && book.actionRoutine) {
      onAddHabit(book.actionRoutine);
      SoundService.playCheck();
      setModalConfig({
        visible: true,
        title: "META DE LEITURA FORJADA",
        message: `A rotina diária "${book.actionRoutine.habitName}" foi adicionada com sucesso ao seu Core de Metas!`,
        type: "success",
        confirmText: "CONTINUAR",
        onConfirm: () => setModalConfig((prev) => ({ ...prev, visible: false })),
      });
    }
  };

  const filteredBooks =
    selectedCategory === "ALL"
      ? BOOKS_CATALOG
      : BOOKS_CATALOG.filter((b) => b.category === selectedCategory);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTag}>
          <Text style={styles.headerTagText}>[WISDOM REPOSITORY]</Text>
        </View>
        <Text style={styles.title}>Biblioteca Curada & Ideias</Text>
        <Text style={styles.subtitle}>
          Grandes obras de tecnologia, política, finanças e mente para alimentar seu intelecto.
        </Text>
      </View>

      {/* Switcher de Visão: Catálogo vs Lista de Interesse */}
      <View style={styles.viewSwitcher}>
        <TouchableOpacity
          style={[styles.viewTab, activeView === "catalog" && styles.viewTabActive]}
          onPress={() => {
            SoundService.playClick();
            setActiveView("catalog");
          }}
        >
          <Text
            style={[
              styles.viewTabText,
              activeView === "catalog" && styles.viewTabTextActive,
            ]}
          >
            Catálogo & Destaques
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.viewTab, activeView === "wishlist" && styles.viewTabActive]}
          onPress={() => {
            SoundService.playClick();
            setActiveView("wishlist");
          }}
        >
          <Text
            style={[
              styles.viewTabText,
              activeView === "wishlist" && styles.viewTabTextActive,
            ]}
          >
            Lista de Interesse ({wishlist.length})
          </Text>
        </TouchableOpacity>
      </View>

      {activeView === "catalog" ? (
        <>
          {/* Card de Destaque Semanal com Rotação Automática */}
          <View style={styles.weeklyCard}>
            <View style={styles.weeklyHeader}>
              <Text style={styles.weeklyBadge}>SELEÇÃO DA SEMANA #{weeklyInfo.weekNumber}</Text>
              <Text style={styles.weeklySub}>Rotação semanal sem repetições</Text>
            </View>
            <Text style={styles.weeklyDesc}>
              4 livros fundamentais selecionados para balancear seu desenvolvimento técnico, político, comportamental e financeiro.
            </Text>
          </View>

          {/* Categorias Filtro em Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryContainer}
          >
            {BOOK_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => {
                  SoundService.playClick();
                  setSelectedCategory(cat.id);
                }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat.id && styles.categoryTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Lista de Livros do Catálogo */}
          <View style={styles.booksGrid}>
            {filteredBooks.map((book) => {
              const inWishlist = isBookInWishlist(book.id);
              return (
                <View key={book.id} style={styles.bookCard}>
                  <View style={styles.bookTopRow}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>[{book.tag.toUpperCase()}]</Text>
                    </View>
                    <Text style={styles.pagesText}>{book.pages} páginas</Text>
                  </View>

                  <Text style={styles.bookTitle}>{book.title}</Text>
                  <Text style={styles.bookAuthor}>{book.author}</Text>

                  <View style={styles.takeawaysContainer}>
                    <Text style={styles.takeawaysHeader}>Lições Essenciais:</Text>
                    {book.takeaways.map((t, idx) => (
                      <View key={idx} style={styles.takeawayRow}>
                        <Text style={styles.bulletSymbol}>▪</Text>
                        <Text style={styles.takeawayText}>{t}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Ações: Comprar, Adicionar a Interesse, Adicionar à Rotina */}
                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[
                        styles.interestBtn,
                        inWishlist && styles.interestBtnActive,
                      ]}
                      onPress={() => handleToggleWishlist(book)}
                    >
                      <Text
                        style={[
                          styles.interestBtnText,
                          inWishlist && styles.interestBtnTextActive,
                        ]}
                      >
                        {inWishlist ? "✓ Salvo nos Interesses" : "+ Tenho Interesse"}
                      </Text>
                    </TouchableOpacity>

                    {book.buyUrl && (
                      <TouchableOpacity
                        style={styles.buyBtn}
                        onPress={() => handleOpenStore(book.buyUrl)}
                      >
                        <Text style={styles.buyBtnText}>Onde Comprar ↗</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.addRoutineBtn}
                    onPress={() => handleAddHabit(book)}
                  >
                    <Text style={styles.addRoutineText}>
                      + Forjar Meta de Leitura ({book.actionRoutine.targetValue} {book.actionRoutine.unit})
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </>
      ) : (
        /* VISÃO: MINHA LISTA DE INTERESSE */
        <View style={styles.wishlistContainer}>
          {wishlist.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Sua lista de interesses está vazia</Text>
              <Text style={styles.emptySubtitle}>
                Navegue pelo catálogo e clique em "+ Tenho Interesse" para salvar os livros que você pretende adquirir ou ler no futuro.
              </Text>
              <TouchableOpacity
                style={styles.backToCatalogBtn}
                onPress={() => setActiveView("catalog")}
              >
                <Text style={styles.backToCatalogText}>Explorar Catálogo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            wishlist.map((item) => {
              const fullBook = BOOKS_CATALOG.find((b) => b.id === item.id) || item;
              return (
                <View key={item.id} style={styles.wishlistCard}>
                  <View style={styles.wishlistHeader}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>[{item.category}]</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleToggleWishlist(fullBook)}
                      style={styles.removeWishlistBtn}
                    >
                      <Text style={styles.removeWishlistText}>Remover ✕</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.bookTitle}>{item.title}</Text>
                  <Text style={styles.bookAuthor}>{item.author}</Text>

                  <View style={styles.wishlistActions}>
                    {item.buyUrl ? (
                      <TouchableOpacity
                        style={styles.buyBtn}
                        onPress={() => handleOpenStore(item.buyUrl)}
                      >
                        <Text style={styles.buyBtnText}>Onde Comprar ↗</Text>
                      </TouchableOpacity>
                    ) : null}

                    {fullBook.actionRoutine && (
                      <TouchableOpacity
                        style={styles.addRoutineBtnCompact}
                        onPress={() => handleAddHabit(fullBook)}
                      >
                        <Text style={styles.addRoutineText}>Mover para Meta Diária</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}

      {/* Cyber Modal */}
      <CyberModal
        visible={modalConfig.visible}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: "#080C14",
  },
  header: {
    marginBottom: 16,
  },
  headerTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    backgroundColor: "rgba(0, 240, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.3)",
    marginBottom: 6,
  },
  headerTagText: {
    fontSize: 10,
    color: "#00F0FF",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#F8FAFC",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12.5,
    color: "#94A3B8",
    lineHeight: 18,
  },
  viewSwitcher: {
    flexDirection: "row",
    backgroundColor: "#0D131F",
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  viewTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 8,
  },
  viewTabActive: {
    backgroundColor: "rgba(0, 240, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.35)",
  },
  viewTabText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  viewTabTextActive: {
    color: "#00F0FF",
    fontWeight: "800",
  },
  weeklyCard: {
    backgroundColor: "rgba(16, 185, 129, 0.06)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    marginBottom: 14,
  },
  weeklyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  weeklyBadge: {
    fontSize: 11,
    color: "#10B981",
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  weeklySub: {
    fontSize: 10,
    color: "#64748B",
  },
  weeklyDesc: {
    fontSize: 12,
    color: "#CBD5E1",
    lineHeight: 17,
  },
  categoryScroll: {
    marginBottom: 14,
  },
  categoryContainer: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#0D131F",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  categoryChipActive: {
    backgroundColor: "rgba(0, 240, 255, 0.15)",
    borderColor: "#00F0FF",
  },
  categoryText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#94A3B8",
  },
  categoryTextActive: {
    color: "#00F0FF",
    fontWeight: "700",
  },
  booksGrid: {
    gap: 14,
    paddingBottom: 40,
  },
  bookCard: {
    backgroundColor: "#0D131F",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  bookTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: "#64748B",
    fontWeight: "700",
  },
  pagesText: {
    fontSize: 11,
    color: "#64748B",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#F8FAFC",
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 12,
    color: "#00F0FF",
    marginBottom: 12,
  },
  takeawaysContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  takeawaysHeader: {
    fontSize: 10.5,
    color: "#64748B",
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  takeawayRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 5,
  },
  bulletSymbol: {
    color: "#10B981",
    fontSize: 11,
    marginRight: 6,
    marginTop: 1,
  },
  takeawayText: {
    flex: 1,
    fontSize: 11.5,
    color: "#CBD5E1",
    lineHeight: 16,
  },
  cardActions: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  interestBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    alignItems: "center",
  },
  interestBtnActive: {
    borderColor: "#10B981",
    backgroundColor: "rgba(16, 185, 129, 0.12)",
  },
  interestBtnText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#94A3B8",
  },
  interestBtnTextActive: {
    color: "#10B981",
  },
  buyBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.35)",
    backgroundColor: "rgba(245, 158, 11, 0.08)",
    alignItems: "center",
  },
  buyBtnText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#F59E0B",
  },
  addRoutineBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "rgba(0, 240, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.4)",
    alignItems: "center",
  },
  addRoutineText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#00F0FF",
    letterSpacing: 0.3,
  },
  wishlistContainer: {
    paddingBottom: 40,
    gap: 12,
  },
  emptyState: {
    backgroundColor: "#0D131F",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  backToCatalogBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#00F0FF",
  },
  backToCatalogText: {
    color: "#05080F",
    fontWeight: "800",
    fontSize: 12,
  },
  wishlistCard: {
    backgroundColor: "#0D131F",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.2)",
  },
  wishlistHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  removeWishlistBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  removeWishlistText: {
    fontSize: 11,
    color: "#FF3366",
    fontWeight: "700",
  },
  wishlistActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  addRoutineBtnCompact: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0, 240, 255, 0.15)",
    borderWidth: 1,
    borderColor: "#00F0FF",
    alignItems: "center",
    justifyContent: "center",
  },
});
