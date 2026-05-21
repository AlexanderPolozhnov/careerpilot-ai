import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        allowedHosts: ['krypton-cruelty-hypocrite.ngrok-free.dev'],
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    // Группируем ключевые зависимости в отдельные чанки для кэширования
                    if (id.includes('node_modules')) {
                        if (id.includes('react-router-dom') || id.includes('react-router') || id.includes('@remix-run')) {
                            return 'router-vendor';
                        }
                        if (id.includes('react') || id.includes('react-dom')) {
                            return 'react-vendor';
                        }
                        if (id.includes('@tanstack') || id.includes('query')) {
                            return 'state-vendor';
                        }
                        if (id.includes('lucide-react')) {
                            return 'icons-vendor';
                        }
                        if (id.includes('i18next')) {
                            return 'i18n-vendor';
                        }
                        // Все остальные мелкие зависимости в общий vendor-чанк
                        return 'vendor';
                    }
                }
            }
        },
        // Предупреждение о большом размере чанка (опционально увеличиваем лимит)
        chunkSizeWarningLimit: 1000
    }
})
