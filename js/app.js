import React, { useState } from 'react';
import { 
  SafeAreaView, 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StatusBar, 
  ScrollView,
  Share,
  useColorScheme,
  ToastAndroid,
  Platform,
  Alert
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';

// Importation du module de cryptage
import NYQCrypto from './crypto';

// Couleurs de l'application
const Colors = {
  primary: '#3A539B',    // Bleu NYQ
  success: '#27AE60',    // Vert
  info: '#2980B9',       // Bleu
  danger: '#E74C3C',     // Rouge
  dark: '#34495E',       // Gris foncé
  light: '#F7F9FC',      // Fond clair
  white: '#FFFFFF',
  darkBg: '#1A2530',     // Fond sombre
  darkInput: '#2C3E50',  // Entrée sombre
  grey: '#95A5A6',       // Gris
};

// Écran principal de cryptage
function CryptoScreen() {
  const [key, setKey] = useState('');
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [showResult, setShowResult] = useState(false);
  const colorScheme = useColorScheme();
  
  const isDarkMode = colorScheme === 'dark';
  
  // Fonction pour afficher un toast
  const showToast = (message) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('NYQ-Crypt', message);
    }
  };
  
  // Fonction de cryptage
  const encrypt = () => {
    if (!key.trim()) {
      showToast('Veuillez entrer une clé de cryptage');
      return;
    }
    
    if (!text.trim()) {
      showToast('Veuillez entrer un texte à crypter');
      return;
    }
    
    try {
      const crypto = new NYQCrypto(key);
      const encrypted = crypto.encrypt(text);
      setResult(encrypted);
      setShowResult(true);
      showToast('Cryptage réussi');
    } catch (error) {
      showToast('Erreur de cryptage: ' + error.message);
    }
  };
  
  // Fonction de décryptage
  const decrypt = () => {
    if (!key.trim()) {
      showToast('Veuillez entrer une clé de cryptage');
      return;
    }
    
    if (!text.trim()) {
      showToast('Veuillez entrer un texte à décrypter');
      return;
    }
    
    try {
      const crypto = new NYQCrypto(key);
      const decrypted = crypto.decrypt(text);
      setResult(decrypted);
      setShowResult(true);
      showToast('Décryptage réussi');
    } catch (error) {
      showToast('Erreur de décryptage: ' + error.message);
    }
  };
  
  // Fonction de partage
  const shareResult = async () => {
    if (!result) {
      showToast('Aucun résultat à partager');
      return;
    }
    
    try {
      await Share.share({
        message: result,
        title: 'Texte crypté via NYQ-Crypt'
      });
    } catch (error) {
      showToast('Erreur lors du partage');
    }
  };
  
  return (
    <SafeAreaView style={[
      styles.container, 
      isDarkMode ? { backgroundColor: Colors.darkBg } : { backgroundColor: Colors.light }
    ]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>N</Text>
          </View>
          <Text style={styles.headerTitle}>NYQ-Crypt</Text>
        </View>
        
        <View style={styles.content}>
          <TextInput
            style={[
              styles.input,
              isDarkMode ? { backgroundColor: Colors.darkInput, color: Colors.white } : null
            ]}
            placeholder="Clé de cryptage"
            placeholderTextColor={Colors.grey}
            value={key}
            onChangeText={setKey}
            secureTextEntry
          />
          
          <TextInput
            style={[
              styles.textArea,
              isDarkMode ? { backgroundColor: Colors.darkInput, color: Colors.white } : null
            ]}
            placeholder="Texte à crypter/décrypter"
            placeholderTextColor={Colors.grey}
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={4}
          />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, { backgroundColor: Colors.success }]} onPress={encrypt}>
              <Text style={styles.buttonText}>CRYPTER</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.button, { backgroundColor: Colors.info }]} onPress={decrypt}>
              <Text style={styles.buttonText}>DÉCRYPTER</Text>
            </TouchableOpacity>
          </View>
          
          {showResult && (
            <View style={[
              styles.resultContainer,
              isDarkMode ? { backgroundColor: Colors.darkInput } : { backgroundColor: Colors.white }
            ]}>
              <Text style={[
                styles.resultTitle,
                isDarkMode ? { color: Colors.white } : { color: Colors.dark }
              ]}>Résultat:</Text>
              <Text style={[
                styles.resultText,
                isDarkMode ? { color: Colors.light } : { color: Colors.dark }
              ]}>{result}</Text>
              
              <TouchableOpacity 
                style={[
                  styles.shareButton,
                  isDarkMode ? { backgroundColor: Colors.darkBg } : { backgroundColor: Colors.light } 
                ]} 
                onPress={shareResult}
              >
                <Text style={isDarkMode ? { color: Colors.white } : { color: Colors.dark }}>
                  Partager
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Écran d'historique
function HistoryScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  return (
    <SafeAreaView style={[
      styles.container, 
      isDarkMode ? { backgroundColor: Colors.darkBg } : { backgroundColor: Colors.light }
    ]}>
      <Text style={[
        styles.centeredText,
        isDarkMode ? { color: Colors.white } : { color: Colors.dark }
      ]}>
        Historique de vos cryptages
      </Text>
    </SafeAreaView>
  );
}

// Écran de paramètres
function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  return (
    <SafeAreaView style={[
      styles.container, 
      isDarkMode ? { backgroundColor: Colors.darkBg } : { backgroundColor: Colors.light }
    ]}>
      <Text style={[
        styles.centeredText,
        isDarkMode ? { color: Colors.white } : { color: Colors.dark }
      ]}>
        Paramètres
      </Text>
    </SafeAreaView>
  );
}

// Configuration du navigateur d'onglets
const Tab = createBottomTabNavigator();

function App() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  
  return (
    <NavigationContainer>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={Colors.primary}
      />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            
            if (route.name === 'Crypter') {
              iconName = focused ? 'lock-closed' : 'lock-closed-outline';
            } else if (route.name === 'Historique') {
              iconName = focused ? 'time' : 'time-outline';
            } else if (route.name === 'Paramètres') {
              iconName = focused ? 'settings' : 'settings-outline';
            }
            
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.grey,
          tabBarStyle: {
            backgroundColor: isDarkMode ? Colors.darkInput : Colors.white,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Crypter" component={CryptoScreen} />
        <Tab.Screen name="Historique" component={HistoryScreen} />
        <Tab.Screen name="Paramètres" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Styles de l'application
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16
  }
})
