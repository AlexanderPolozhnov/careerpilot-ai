package com.alexanderpolozhnov.careerpilot.common.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Component
@Converter(autoApply = false)
public class EncryptionConverter implements AttributeConverter<String, String> {

    private static final String ALGORITHM = "AES/CBC/PKCS5Padding";
    private static final String TRANSFORMATION = "AES";
    private static final int IV_LENGTH = 16;

    @Value("${app.encryption.master-key}")
    private String masterKey;

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return attribute;
        }

        if (masterKey == null || masterKey.isBlank()) {
            System.err.println("CRITICAL: Encryption master key is not set! Storing in plaintext.");
            return attribute;
        }

        try {
            byte[] keyBytes = masterKey.getBytes(StandardCharsets.UTF_8);
            if (keyBytes.length != 16 && keyBytes.length != 24 && keyBytes.length != 32) {
                System.err.println("CRITICAL: Invalid master key length: " + keyBytes.length + " bytes. Expected 16, 24, or 32.");
                return attribute;
            }
            
            SecretKeySpec secretKey = new SecretKeySpec(keyBytes, TRANSFORMATION);
            
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey);
            
            byte[] encrypted = cipher.doFinal(attribute.getBytes(StandardCharsets.UTF_8));
            byte[] iv = cipher.getIV();
            
            if (iv == null) {
                System.err.println("CRITICAL: Failed to generate IV for encryption.");
                return attribute;
            }
            
            byte[] combined = new byte[iv.length + encrypted.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(encrypted, 0, combined, iv.length, encrypted.length);
            
            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            System.err.println("Encryption failed: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Encryption failed: " + e.getMessage(), e);
        }
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return dbData;
        }

        if (masterKey == null || masterKey.isBlank()) {
            return dbData;
        }

        try {
            byte[] combined = Base64.getDecoder().decode(dbData);
            
            if (combined.length <= IV_LENGTH) {
                return dbData;
            }
            
            byte[] iv = new byte[IV_LENGTH];
            System.arraycopy(combined, 0, iv, 0, iv.length);
            
            byte[] encrypted = new byte[combined.length - iv.length];
            System.arraycopy(combined, iv.length, encrypted, 0, encrypted.length);
            
            byte[] keyBytes = masterKey.getBytes(StandardCharsets.UTF_8);
            if (keyBytes.length != 16 && keyBytes.length != 24 && keyBytes.length != 32) {
                return dbData;
            }
            
            SecretKeySpec secretKey = new SecretKeySpec(keyBytes, TRANSFORMATION);
            
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            IvParameterSpec ivSpec = new IvParameterSpec(iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, ivSpec);
            
            byte[] decrypted = cipher.doFinal(encrypted);
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            // Если дешифрование не удалось (например, мастер-ключ изменился или данные не зашифрованы),
            // возвращаем исходное значение, чтобы не потерять данные
            return dbData;
        }
    }
}
