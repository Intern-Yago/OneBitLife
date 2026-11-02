import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  BOOK_CATEGORIES,
  BOOKS_CATALOG,
  getWeeklyFeaturedBooks,
} from "../../Database/BooksData";
import BookSearchService, {
  POPULAR_DISCIPLINES,
} from "../../services/BookSearchService";
import HabitsService from "../../services/HabitsService";
import SoundService from "../../services/SoundService";
import CyberModal from "../Common/CyberModal";

export default function BooksTab({ onAddHabit }) {
  const [activeView, setActiveView] = useState("explorer"); // 'explorer' | 'foundations' | 'wishlist'
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentDiscipline, setCurrentDiscipline] = useState("biologia");

  const [selectedFoundationCategory, setSelectedFoundationCategory] = useState("ALL");
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
    // Faz uma busca inicial pela disciplina padrão (ex: biologia)
    handleDisciplineSelect("biologia");
  }, []);

  const handleDisciplineSelect = async (queryText, forceRefresh = false) => {
    SoundService.playClick();
    setCurrentDiscipline(queryText);
    setSearchQuery(queryText);
    setIsSearching(true);
    try {
      const results = await BookSearchService.searchBooks(queryText, 12, forceRefresh);
      setSearchResults(results);
    } catch (err) {
      console.warn("Erro na busca por disciplina:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualSearch = async () => {
    if (!searchQuery.trim()) return;
    SoundService.playClick();
    setIsSearching(true);
    try {
      const results = await BookSearchService.searchBooks(searchQuery, 12);
      setSearchResults(results);
      if (results.length === 0) {
        SoundService.playBeep();
      }
    } catch (err) {
      console.warn("Erro na busca manual:", err);
    } finally {
      setIsSearching(false);
    }
  };

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
            category: book.category || "GERAL",
            buyUrl: book.buyUrl,
            coverUrl: book.coverUrl,
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

  const filteredFoundations =
    selectedFoundationCategory === "ALL"
      ? BOOKS_CATALOG
      : BOOKS_CATALOG.filter((b) => b.category === selectedFoundationCategory);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTag}>
          <Text style={styles.headerTagText}>[REPOSITÓRIO UNIVERSAL DO SABER]</Text>
        </View>
        <Text style={styles.title}>Biblioteca & Conhecimento</Text>
        <Text style={styles.subtitle}>
          Explore acervos de qualquer disciplina em Português (PT-BR) com capas e links de compra.
        </Text>
      </View>

      {/* Switcher de Visão: Explorador Universal vs Fundamentos vs Lista de Interesse */}
      <View style={styles.viewSwitcher}>
        <TouchableOpacity
          style={[styles.viewTab, activeView === "explorer" && styles.viewTabActive]}
          onPress={() => {
            SoundService.playClick();
            setActiveView("explorer");
          }}
        >
          <Text
            style={[
              styles.viewTabText,
              activeView === "explorer" && styles.viewTabTextActive,
            ]}
          >
            Explorar Áreas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.viewTab, activeView === "foundations" && styles.viewTabActive]}
          onPress={() => {
            SoundService.playClick();
            setActiveView("foundations");
          }}
        >
          <Text
            style={[
              styles.viewTabText,
              activeView === "foundations" && styles.viewTabTextActive,
            ]}
          >
            Fundamentos
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
            Interesses ({wishlist.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* ======================================================== */}
      {/* VISÃO 1: EXPLORADOR UNIVERSAL COM OPEN LIBRARY API       */}
      {/* ======================================================== */}
      {activeView === "explorer" && (
        <View style={styles.explorerSection}>
          {/* Barra de Busca Universal */}
          <View style={styles.searchBarRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquise em PT-BR: Biologia, Direito, Arte..."
              placeholderTextColor="#64748B"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleManualSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearSearchBtn}
                onPress={() => {
                  SoundService.playClick();
                  setSearchQuery("");
                }}
              >
                <Text style={styles.clearSearchText}>✕</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.searchActionBtn}
              onPress={handleManualSearch}
            >
              <Text style={styles.searchActionText}>Buscar</Text>
            </TouchableOpacity>
          </View>

          {/* Status do Catálogo & Cache Semanal */}
          <View style={styles.cacheStatusBar}>
            <Text style={styles.cacheStatusText}>
              ✓ Catálogo PT-BR • Cache Semanal Offline (7 dias)
            </Text>
            <TouchableOpacity
              onPress={() => handleDisciplineSelect(currentDiscipline, true)}
              style={styles.refreshCacheBtn}
            >
              <Text style={styles.refreshCacheText}>↻ Sincronizar</Text>
            </TouchableOpacity>
          </View>

          {/* Chips Rápidos de Disciplinas */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.disciplineScroll}
            contentContainerStyle={styles.disciplineContainer}
          >
            {POPULAR_DISCIPLINES.map((disc) => (
              <TouchableOpacity
                key={disc.id}
                style={[
                  styles.disciplineChip,
                  currentDiscipline === disc.query && styles.disciplineChipActive,
                ]}
                onPress={() => handleDisciplineSelect(disc.query)}
              >
                <Text
                  style={[
                    styles.disciplineText,
                    currentDiscipline === disc.query && styles.disciplineTextActive,
                  ]}
                >
                  [{disc.label}]
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Estado de Carregamento */}
          {isSearching && (
            <View style={styles.loadingBox}>
              <ActivityIndicator color="#00F0FF" size="small" />
              <Text style={styles.loadingText}>
                Consultando acervo mundial da Open Library...
              </Text>
            </View>
          )}

          {/* Resultados da Busca com Capas de Livros */}
          {!isSearching && searchResults.length === 0 ? (
            <View style={styles.emptySearchBox}>
              <Text style={styles.emptySearchTitle}>Nenhum livro encontrado</Text>
              <Text style={styles.emptySearchDesc}>
                Tente buscar por termos mais amplos (ex: "biologia", "direito penal", "anatomia", "design").
              </Text>
            </View>
          ) : (
            <View style={styles.booksGrid}>
              {searchResults.map((book) => {
                const inWishlist = isBookInWishlist(book.id);
                return (
                  <View key={book.id} style={styles.bookCardUniversal}>
                    <View style={styles.bookCardContentRow}>
                      {/* Capa do Livro */}
                      <View style={styles.coverWrapper}>
                        {book.coverUrl ? (
                          <Image
                            source={{ uri: book.coverUrl }}
                            style={styles.bookCoverImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.coverPlaceholder}>
                            <Text style={styles.coverPlaceholderText}>LIVRO</Text>
                          </View>
                        )}
                      </View>

                      {/* Informações da Obra */}
                      <View style={styles.bookDetailsCol}>
                        <View style={styles.metaRow}>
                          <Text style={styles.categoryBadgeText}>[{book.category}]</Text>
                          {book.year && (
                            <Text style={styles.yearText}>{book.year}</Text>
                          )}
                        </View>

                        <Text style={styles.bookTitle} numberOfLines={2}>
                          {book.title}
                        </Text>
                        <Text style={styles.bookAuthor} numberOfLines={1}>
                          {book.author}
                        </Text>

                        {book.pages !== "N/A" && (
                          <Text style={styles.pagesText}>{book.pages} páginas est.</Text>
                        )}
                      </View>
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
                          {inWishlist ? "✓ Salvo" : "+ Tenho Interesse"}
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
                        + Forjar Meta de Leitura ({book.actionRoutine.targetValue} min)
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* ======================================================== */}
      {/* VISÃO 2: FUNDAMENTOS & DESTAQUES SEMANAIS (OFFLINE)      */}
      {/* ======================================================== */}
      {activeView === "foundations" && (
        <View style={styles.foundationsSection}>
          <View style={styles.weeklyCard}>
            <View style={styles.weeklyHeader}>
              <Text style={styles.weeklyBadge}>SELEÇÃO DA SEMANA #{weeklyInfo.weekNumber}</Text>
              <Text style={styles.weeklySub}>Rotação semanal offline</Text>
            </View>
            <Text style={styles.weeklyDesc}>
              Obras fundamentais selecionadas para desenvolvimento intelectual, político, comportamental e financeiro.
            </Text>
          </View>

          {/* Filtros em Chips */}
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
                  selectedFoundationCategory === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => {
                  SoundService.playClick();
                  setSelectedFoundationCategory(cat.id);
                }}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedFoundationCategory === cat.id && styles.categoryTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Lista de Fundamentos */}
          <View style={styles.booksGrid}>
            {filteredFoundations.map((book) => {
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
        </View>
      )}

      {/* ======================================================== */}
      {/* VISÃO 3: MINHA LISTA DE INTERESSE (WISHLIST SQLITE)      */}
      {/* ======================================================== */}
      {activeView === "wishlist" && (
        <View style={styles.wishlistContainer}>
          {wishlist.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Sua lista de interesses está vazia</Text>
              <Text style={styles.emptySubtitle}>
                Busque qualquer livro de sua área no Explorador e toque em "+ Tenho Interesse" para salvá-lo aqui.
              </Text>
              <TouchableOpacity
                style={styles.backToCatalogBtn}
                onPress={() => setActiveView("explorer")}
              >
                <Text style={styles.backToCatalogText}>Explorar Livros</Text>
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
    marginBottom: 14,
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
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748B",
  },
  viewTabTextActive: {
    color: "#00F0FF",
    fontWeight: "800",
  },
  explorerSection: {
    paddingBottom: 40,
  },
  searchBarRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0D131F",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.3)",
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: "#F8FAFC",
    fontSize: 13,
    fontWeight: "600",
  },
  clearSearchBtn: {
    padding: 6,
    marginRight: 4,
  },
  clearSearchText: {
    color: "#64748B",
    fontSize: 14,
  },
  searchActionBtn: {
    backgroundColor: "rgba(0, 240, 255, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#00F0FF",
  },
  searchActionText: {
    color: "#00F0FF",
    fontSize: 11.5,
    fontWeight: "800",
  },
  disciplineScroll: {
    marginBottom: 14,
  },
  disciplineContainer: {
    gap: 8,
  },
  disciplineChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#0D131F",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  disciplineChipActive: {
    borderColor: "#00F0FF",
    backgroundColor: "rgba(0, 240, 255, 0.12)",
  },
  disciplineText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "700",
  },
  disciplineTextActive: {
    color: "#00F0FF",
  },
  loadingBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 20,
  },
  loadingText: {
    color: "#64748B",
    fontSize: 12,
  },
  emptySearchBox: {
    backgroundColor: "#0D131F",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    marginTop: 10,
  },
  emptySearchTitle: {
    color: "#F8FAFC",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 6,
  },
  emptySearchDesc: {
    color: "#64748B",
    fontSize: 11.5,
    textAlign: "center",
  },
  booksGrid: {
    gap: 14,
  },
  bookCardUniversal: {
    backgroundColor: "#0D131F",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  bookCardContentRow: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 12,
  },
  coverWrapper: {
    width: 70,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#080C14",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  bookCoverImage: {
    width: "100%",
    height: "100%",
  },
  coverPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 240, 255, 0.05)",
  },
  coverPlaceholderText: {
    color: "#00F0FF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  bookDetailsCol: {
    flex: 1,
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  categoryBadgeText: {
    fontSize: 9.5,
    color: "#64748B",
    fontWeight: "800",
  },
  yearText: {
    fontSize: 10,
    color: "#64748B",
  },
  bookTitle: {
    fontSize: 14.5,
    fontWeight: "800",
    color: "#F8FAFC",
    marginBottom: 3,
    lineHeight: 19,
  },
  bookAuthor: {
    fontSize: 12,
    color: "#00F0FF",
    marginBottom: 4,
  },
  pagesText: {
    fontSize: 11,
    color: "#64748B",
  },
  foundationsSection: {
    paddingBottom: 40,
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
  cacheStatusBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(0, 240, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.15)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 12,
  },
  cacheStatusText: {
    color: "#00F0FF",
    fontSize: 10.5,
    fontWeight: "700",
  },
  refreshCacheBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: "rgba(0, 240, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(0, 240, 255, 0.3)",
  },
  refreshCacheText: {
    color: "#00F0FF",
    fontSize: 10.5,
    fontWeight: "800",
  },
});
