import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";

export default function LogoutScreen() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);

      const response = await fetch("http://TU_IP:8009/api/auth/logout", {
        method: "POST",
        credentials: "include", // IMPORTANTE para enviar cookies de sesión
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.ok) {
        Alert.alert("Sesión cerrada", "Logout exitoso");
        // Aquí puedes navegar al login
        // navigation.replace("Login");
      } else {
        Alert.alert("Error", "No se pudo cerrar sesión");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cerrar Sesión</Text>

      <TouchableOpacity style={styles.button} onPress={handleLogout} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Logout</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#e74c3c",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});