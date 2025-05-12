#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <algorithm>
#include <cstring>
#include <cstdlib>

// Pour le support HTTP (version simplifiée)
#include <cpprest/http_listener.h>
#include <cpprest/json.h>

using namespace web;
using namespace web::http;
using namespace web::http::experimental::listener;

// Classe pour gérer le chiffrement/déchiffrement
class CryptoEngine {
private:
    // Mélange les bits d'un octet (pour renforcer le XOR)
    unsigned char mixBits(unsigned char byte) {
        unsigned char result = ((byte & 0xF0) >> 4) | ((byte & 0x0F) << 4);
        result = ((result & 0xCC) >> 2) | ((result & 0x33) << 2);
        result = ((result & 0xAA) >> 1) | ((result & 0x55) << 1);
        return result;
    }

public:
    // Fonction de chiffrement/déchiffrement de texte
    std::string processText(const std::string& text, const std::string& key) {
        if (text.empty() || key.empty()) {
            return text; // Rien à faire si texte ou clé vide
        }

        std::string result = text;
        size_t keyLength = key.length();
        size_t textLength = text.length();

        // Premier passage : XOR simple avec la clé
        for (size_t i = 0; i < textLength; i++) {
            result[i] = result[i] ^ key[i % keyLength];
        }

        // Second passage : mélanger les bits pour un niveau supplémentaire
        for (size_t i = 0; i < textLength; i++) {
            result[i] = mixBits(result[i]);
        }

        return result;
    }

    // Fonction pour traiter les données binaires
    std::vector<unsigned char> processBinary(const std::vector<unsigned char>& data, const std::string& key) {
        if (data.empty() || key.empty()) {
            return data; // Rien à faire si données ou clé vide
        }

        std::vector<unsigned char> result = data;
        size_t keyLength = key.length();
        size_t dataLength = data.size();

        // Premier passage : XOR simple avec la clé
        for (size_t i = 0; i < dataLength; i++) {
            result[i] = result[i] ^ key[i % keyLength];
        }

        // Second passage : mélanger les bits pour un niveau supplémentaire
        for (size_t i = 0; i < dataLength; i++) {
            result[i] = mixBits(result[i]);
        }

        return result;
    }

    // Fonction pour encoder en Base64 (pour la transmission de données binaires)
    std::string base64Encode(const std::vector<unsigned char>& data) {
        static const char base64Chars[] = 
             "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
             "abcdefghijklmnopqrstuvwxyz"
             "0123456789+/";

        std::string result;
        size_t i = 0;
        unsigned char array3[3];
        unsigned char array4[4];
        size_t dataLength = data.size();

        while (i < dataLength) {
            size_t bytesToWrite = 0;
            bytesToWrite = std::min((size_t)3, dataLength - i);
            
            array3[0] = array3[1] = array3[2] = 0;
            for (size_t j = 0; j < bytesToWrite; j++) {
                array3[j] = data[i++];
            }

            array4[0] = (array3[0] & 0xfc) >> 2;
            array4[1] = ((array3[0] & 0x03) << 4) + ((array3[1] & 0xf0) >> 4);
            array4[2] = ((array3[1] & 0x0f) << 2) + ((array3[2] & 0xc0) >> 6);
            array4[3] = array3[2] & 0x3f;

            for (size_t j = 0; j < 4; j++) {
                if (j <= bytesToWrite) {
                    result += base64Chars[array4[j]];
                } else {
                    result += '=';
                }
            }
        }

        return result;
    }

    // Fonction pour décoder du Base64
    std::vector<unsigned char> base64Decode(const std::string& encoded) {
        static const std::string base64Chars = 
             "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
             "abcdefghijklmnopqrstuvwxyz"
             "0123456789+/";
             
        std::vector<unsigned char> result;
        size_t in_len = encoded.size();
        size_t i = 0;
        size_t in_ = 0;
        unsigned char array4[4], array3[3];

        auto isBase64 = [&](unsigned char c) -> bool {
            return (isalnum(c) || (c == '+') || (c == '/'));
        };

        while (in_len-- && (encoded[in_] != '=') && isBase64(encoded[in_])) {
            array4[i++] = encoded[in_]; in_++;
            if (i == 4) {
                for (i = 0; i < 4; i++) {
                    array4[i] = base64Chars.find(array4[i]);
                }

                array3[0] = (array4[0] << 2) + ((array4[1] & 0x30) >> 4);
                array3[1] = ((array4[1] & 0xf) << 4) + ((array4[2] & 0x3c) >> 2);
                array3[2] = ((array4[2] & 0x3) << 6) + array4[3];

                for (i = 0; i < 3; i++) {
                    result.push_back(array3[i]);
                }
                i = 0;
            }
        }

        if (i) {
            for (size_t j = i; j < 4; j++) {
                array4[j] = 0;
            }

            for (size_t j = 0; j < 4; j++) {
                array4[j] = base64Chars.find(array4[j]);
            }

            array3[0] = (array4[0] << 2) + ((array4[1] & 0x30) >> 4);
            array3[1] = ((array4[1] & 0xf) << 4) + ((array4[2] & 0x3c) >> 2);
            array3[2] = ((array4[2] & 0x3) << 6) + array4[3];

            for (size_t j = 0; j < i - 1; j++) {
                result.push_back(array3[j]);
            }
        }

        return result;
    }

    // Fonction pour évaluer la force d'une clé (0-100)
    int evaluateKeyStrength(const std::string& key) {
        if (key.empty()) return 0;
        
        int score = 0;
        
        // Longueur (40%)
        if (key.length() >= 16) {
            score += 40;
        } else if (key.length() >= 12) {
            score += 30;
        } else if (key.length() >= 8) {
            score += 20;
        } else if (key.length() >= 6) {
            score += 10;
        } else {
            score += 5;
        }
        
        // Complexité (60%)
        bool hasUppercase = false;
        bool hasLowercase = false;
        bool hasDigit = false;
        bool hasSpecial = false;
        
        for (char c : key) {
            if (isupper(c)) hasUppercase = true;
            else if (islower(c)) hasLowercase = true;
            else if (isdigit(c)) hasDigit = true;
            else hasSpecial = true;
        }
        
        if (hasUppercase) score += 15;
        if (hasLowercase) score += 15;
        if (hasDigit) score += 15;
        if (hasSpecial) score += 15;
        
        return std::min(score, 100);
    }
};

// Classe pour gérer les requêtes HTTP
class CryptoServer {
private:
    http_listener listener;
    CryptoEngine engine;

public:
    CryptoServer(const std::string& url) : listener(utility::conversions::to_string_t(url)) {
        // Configuration des endpoints
        listener.support(methods::POST, std::bind(&CryptoServer::handlePost, this, std::placeholders::_1));
        listener.support(methods::OPTIONS, std::bind(&CryptoServer::handleOptions, this, std::placeholders::_1));
    }

    // Démarrer le serveur
    void start() {
        try {
            listener.open().wait();
            std::cout << "Serveur de cryptage démarré sur " << utility::conversions::to_utf8string(listener.uri().to_string()) << std::endl;
        } catch (const std::exception& e) {
            std::cerr << "Erreur lors du démarrage du serveur: " << e.what() << std::endl;
        }
    }

    // Arrêter le serveur
    void stop() {
        try {
            listener.close().wait();
            std::cout << "Serveur de cryptage arrêté" << std::endl;
        } catch (const std::exception& e) {
            std::cerr << "Erreur lors de l'arrêt du serveur: " << e.what() << std::endl;
        }
    }

private:
    // Gestion des requêtes CORS (pour l'interface web)
    void handleOptions(http_request request) {
        http_response response(status_codes::OK);
        response.headers().add(U("Access-Control-Allow-Origin"), U("*"));
        response.headers().add(U("Access-Control-Allow-Methods"), U("POST, OPTIONS"));
        response.headers().add(U("Access-Control-Allow-Headers"), U("Content-Type"));
        request.reply(response);
    }

    // Traitement des requêtes POST
    void handlePost(http_request request) {
        try {
            // Configurer la réponse CORS
            http_response response(status_codes::OK);
            response.headers().add(U("Access-Control-Allow-Origin"), U("*"));
            response.headers().add(U("Content-Type"), U("application/json"));

            // Récupérer le contenu de la requête
            request.extract_json().then([this, &response, request](pplx::task<json::value> task) {
                try {
                    // Récupérer le JSON
                    json::value json = task.get();
                    
                    // Extraire l'action
                    std::string action = utility::conversions::to_utf8string(json.at(U("action")).as_string());
                    
                    // Réponse par défaut
                    json::value jsonResponse;
                    
                    if (action == "encrypt" || action == "decrypt") {
                        // Récupérer la clé et le texte
                        std::string key = utility::conversions::to_utf8string(json.at(U("key")).as_string());
                        
                        // Vérifier le mode (texte ou binaire)
                        bool isBinary = json.has_field(U("isBinary")) && json.at(U("isBinary")).as_bool();
                        
                        if (isBinary) {
                            // Mode binaire - traiter les données encodées en Base64
                            std::string base64Data = utility::conversions::to_utf8string(json.at(U("data")).as_string());
                            std::vector<unsigned char> binaryData = engine.base64Decode(base64Data);
                            
                            // Traiter les données binaires
                            std::vector<unsigned char> processedData = engine.processBinary(binaryData, key);
                            
                            // Encoder le résultat en Base64 pour le retourner
                            std::string resultBase64 = engine.base64Encode(processedData);
                            
                            // Préparer la réponse
                            jsonResponse[U("success")] = json::value::boolean(true);
                            jsonResponse[U("isBinary")] = json::value::boolean(true);
                            jsonResponse[U("result")] = json::value::string(utility::conversions::to_string_t(resultBase64));
                        } else {
                            // Mode texte
                            std::string text = utility::conversions::to_utf8string(json.at(U("text")).as_string());
                            
                            // Traiter le texte
                            std::string processedText = engine.processText(text, key);
                            
                            // Préparer la réponse
                            jsonResponse[U("success")] = json::value::boolean(true);
                            jsonResponse[U("isBinary")] = json::value::boolean(false);
                            jsonResponse[U("result")] = json::value::string(utility::conversions::to_string_t(processedText));
                        }
                    } else if (action == "evaluateKey") {
                        // Évaluation de la force de la clé
                        std::string key = utility::conversions::to_utf8string(json.at(U("key")).as_string());
                        int strength = engine.evaluateKeyStrength(key);
                        
                        // Préparer la réponse
                        jsonResponse[U("success")] = json::value::boolean(true);
                        jsonResponse[U("strength")] = json::value::number(strength);
                    } else {
                        // Action inconnue
                        jsonResponse[U("success")] = json::value::boolean(false);
                        jsonResponse[U("error")] = json::value::string(U("Action non reconnue"));
                    }
                    
                    // Envoyer la réponse
                    response.set_body(jsonResponse);
                    request.reply(response);
                } catch (const std::exception& e) {
                    // Erreur lors du traitement
                    json::value errorResponse;
                    errorResponse[U("success")] = json::value::boolean(false);
                    errorResponse[U("error")] = json::value::string(utility::conversions::to_string_t(e.what()));
                    
                    response.set_body(errorResponse);
                    request.reply(response);
                }
            });
        } catch (const std::exception& e) {
            // Erreur générale
            http_response response(status_codes::InternalError);
            response.headers().add(U("Access-Control-Allow-Origin"), U("*"));
            
            json::value errorResponse;
            errorResponse[U("success")] = json::value::boolean(false);
            errorResponse[U("error")] = json::value::string(utility::conversions::to_string_t(e.what()));
            
            response.set_body(errorResponse);
            request.reply(response);
        }
    }
};

// Programme principal
int main(int argc, char* argv[]) {
    // Port par défaut
    int port = 3000;
    
    // Vérifier si un port est spécifié en argument
    if (argc > 1) {
        port = std::atoi(argv[1]);
        if (port <= 0 || port > 65535) {
            std::cerr << "Port invalide, utilisation du port par défaut 3000" << std::endl;
            port = 3000;
        }
    }
    
    // Créer l'URL du serveur
    std::string serverUrl = "http://localhost:" + std::to_string(port) + "/api/crypto";
    
    try {
        // Démarrer le serveur
        CryptoServer server(serverUrl);
        server.start();
        
        std::cout << "Serveur démarré sur le port " << port << std::endl;
        std::cout << "Appuyez sur Entrée pour arrêter le serveur..." << std::endl;
        
        // Attendre que l'utilisateur appuie sur Entrée pour arrêter le serveur
        std::cin.get();
        
        // Arrêter le serveur
        server.stop();
        
    } catch (const std::exception& e) {
        std::cerr << "Exception: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}