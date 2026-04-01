import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { api } from "./src/api/client";
import { Post, User } from "./src/types/interfaces";
import { PostCard } from "./src/components/PostCard";

type Tab = "feed" | "trending" | "create" | "profile";

export default function App() {
  const [tab, setTab] = useState<Tab>("feed");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("pothole");

  const isAuthenticated = useMemo(() => Boolean(token), [token]);

  async function login() {
    setLoading(true);
    try {
      const result = await api.loginWithGoogle(`demo-google-${Date.now()}`);
      setToken(result.accessToken);
      setUser(result.user);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFeed(trending = false) {
    setLoading(true);
    try {
      const result = trending ? await api.getTrending() : await api.getFeed();
      setPosts(result.posts);
    } finally {
      setLoading(false);
    }
  }

  async function createPost() {
    if (!token || !description.trim()) {
      return;
    }
    setLoading(true);
    try {
      await api.createPost(token, {
        category,
        description,
        latitude: 18.52043,
        longitude: 73.85674,
        locationName: "Detected by app",
        city: "Pune",
        state: "Maharashtra",
        media: [
          {
            type: "image",
            uri: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1080"
          }
        ]
      });
      setDescription("");
      setTab("feed");
      await fetchFeed(false);
    } finally {
      setLoading(false);
    }
  }

  async function toggleUpvote(post: Post) {
    if (!token) {
      return;
    }
    const payload = post.isUpvoted ? api.removeUpvote(token, post.id) : api.upvote(token, post.id);
    const result = await payload;
    setPosts((previous) =>
      previous.map((item) =>
        item.id === post.id ? { ...item, isUpvoted: result.upvoted, upvoteCount: result.newCount } : item
      )
    );
  }

  useEffect(() => {
    if (isAuthenticated && tab === "feed") {
      fetchFeed(false);
    }
    if (isAuthenticated && tab === "trending") {
      fetchFeed(true);
    }
  }, [isAuthenticated, tab]);

  useEffect(() => {
    if (!token) {
      return;
    }
    api.getMe(token).then((result) => setUser(result.user)).catch(() => {});
  }, [token]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.centered}>
          <Text style={styles.title}>Civic Report App</Text>
          <Text style={styles.subtitle}>Sign in to report local civic issues.</Text>
          <Pressable style={styles.primaryButton} onPress={login} disabled={loading}>
            <Text style={styles.primaryButtonText}>{loading ? "Signing in..." : "Sign in with Google (Demo)"}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.appHeader}>Civic Report</Text>
      <View style={styles.tabs}>
        {(["feed", "trending", "create", "profile"] as Tab[]).map((item) => (
          <Pressable key={item} style={[styles.tab, tab === item && styles.activeTab]} onPress={() => setTab(item)}>
            <Text style={[styles.tabText, tab === item && styles.activeTabText]}>{item.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      {loading ? <ActivityIndicator size="large" color="#2563eb" style={styles.loader} /> : null}

      {tab === "feed" || tab === "trending" ? (
        <FlatList
          contentContainerStyle={styles.list}
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PostCard post={item} onToggleUpvote={toggleUpvote} />}
          ListEmptyComponent={<Text style={styles.empty}>No posts available yet.</Text>}
        />
      ) : null}

      {tab === "create" ? (
        <View style={styles.form}>
          <Text style={styles.label}>Category</Text>
          <TextInput value={category} onChangeText={setCategory} style={styles.input} />
          <Text style={styles.label}>Description</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.multiInput]}
            multiline
            placeholder="Describe the civic issue..."
          />
          <Pressable style={styles.primaryButton} onPress={createPost} disabled={loading}>
            <Text style={styles.primaryButtonText}>Submit Report</Text>
          </Pressable>
        </View>
      ) : null}

      {tab === "profile" && user ? (
        <View style={styles.profileCard}>
          <Text style={styles.profileName}>{user.displayName}</Text>
          <Text style={styles.profileMeta}>{user.email || user.phoneNumber || "No contact set"}</Text>
          <Text style={styles.profileMeta}>
            {user.city || "Unknown City"}, {user.state || "Unknown State"}
          </Text>
          <Text style={styles.profileMeta}>Karma: {user.karmaPoints}</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6"
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8
  },
  subtitle: {
    color: "#6b7280",
    marginBottom: 24
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 12
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600"
  },
  appHeader: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10
  },
  tabs: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingBottom: 8
  },
  tab: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 8,
    alignItems: "center"
  },
  activeTab: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb"
  },
  tabText: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "600"
  },
  activeTabText: {
    color: "#fff"
  },
  loader: {
    marginTop: 12
  },
  list: {
    padding: 12
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#6b7280"
  },
  form: {
    padding: 16
  },
  label: {
    color: "#111827",
    fontWeight: "600",
    marginBottom: 6
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14
  },
  multiInput: {
    height: 120,
    textAlignVertical: "top"
  },
  profileCard: {
    margin: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16
  },
  profileName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6
  },
  profileMeta: {
    color: "#4b5563",
    marginBottom: 4
  }
});
